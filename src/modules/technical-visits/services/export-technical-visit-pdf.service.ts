import { Injectable, Logger } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import {
  buildTechnicalVisitPdfBuffer,
  buildTechnicalVisitPdfFilename,
  type TechnicalVisitPdfImageBuffers,
} from '@/common/pdf/build-technical-visit-pdf';
import { UserRepository } from '@/modules/users/repositories/user.repository';
import { StorageService } from '@/modules/storage/services/storage.service';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { TechnicalVisitImageRepository } from '../repositories/technical-visit-image.repository';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { selectVisitImagesForPdf } from '../utils/select-visit-images-for-pdf';
import { toTechnicalVisitApiRow } from '../utils/technical-visit-response';

export interface ExportTechnicalVisitPdfResult {
  buffer: Buffer;
  filename: string;
}

@Injectable()
export class ExportTechnicalVisitPdfService {
  private readonly logger = new Logger(ExportTechnicalVisitPdfService.name);

  constructor(
    private readonly visitRepo: TechnicalVisitRepository,
    private readonly imageRepo: TechnicalVisitImageRepository,
    private readonly storage: StorageService,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(id: string): Promise<ExportTechnicalVisitPdfResult> {
    const visit = await this.visitRepo.findByIdWithAerodrome(id);
    if (!visit) {
      throw resourceNotFound(this.errorMessageService, 'Visita técnica', id);
    }

    const visitDto: TechnicalVisitResponseDTO = await toTechnicalVisitApiRow(
      this.userRepository,
      visit,
    );

    const allImages = await this.imageRepo.findByVisitId(id);
    const selected = selectVisitImagesForPdf(allImages);

    const bySection: TechnicalVisitPdfImageBuffers['bySection'] = {};

    const downloadResults = await Promise.allSettled(
      selected.map((image) =>
        this.storage
          .download(image.imageKey)
          .then((buffer) => ({ image, buffer })),
      ),
    );

    for (let i = 0; i < downloadResults.length; i++) {
      const result = downloadResults[i];
      const image = selected[i];

      if (result.status === 'fulfilled') {
        const { buffer } = result.value;
        const list = bySection[image.section] ?? [];
        list.push(buffer);
        bySection[image.section] = list;
        continue;
      }

      const reason: unknown = result.reason;
      this.logger.warn(
        `Falha ao baixar imagem ${image.id} (${image.imageKey}) para PDF da visita ${id}`,
        reason instanceof Error ? reason.stack : String(reason),
      );
    }

    const buffer = await buildTechnicalVisitPdfBuffer(visitDto, {
      bySection,
    });

    return {
      buffer,
      filename: buildTechnicalVisitPdfFilename(
        visitDto.icao,
        visitDto.aerodromeName,
      ),
    };
  }
}
