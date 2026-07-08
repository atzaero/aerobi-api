import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { getErrorMessage } from '@/common/utils/error.util';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { AuditAction } from '@/generated/prisma/client';
import type { TechnicalVisitImageSection } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';
import { assertValidImageUpload } from '@/modules/storage/utils/assert-valid-image-upload';

import { TechnicalVisitImageResponseDTO } from '../dtos/technical-visit-image-response.dto';
import { TechnicalVisitImageMapper } from '../mappers/technical-visit-image.mapper';
import { TechnicalVisitImageRepository } from '../repositories/technical-visit-image.repository';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import {
  buildTechnicalVisitImageKey,
  MAX_TECHNICAL_VISIT_IMAGE_BYTES,
} from '../utils/technical-visit-image';
import { technicalVisitImageAuditSnapshot } from '../utils/technical-visit-image-audit';

@Injectable()
export class AddTechnicalVisitImageService {
  private readonly logger = new Logger(AddTechnicalVisitImageService.name);

  constructor(
    private readonly visitRepo: TechnicalVisitRepository,
    private readonly imageRepo: TechnicalVisitImageRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    technicalVisitId: string,
    section: TechnicalVisitImageSection,
    image: Express.Multer.File | undefined,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<TechnicalVisitImageResponseDTO> {
    const visit = await this.visitRepo.findById(technicalVisitId);
    if (!visit) {
      throw resourceNotFound(
        this.errorMessageService,
        'Visita técnica',
        technicalVisitId,
      );
    }

    assertValidImageUpload(image, this.errorMessageService, {
      maxBytes: MAX_TECHNICAL_VISIT_IMAGE_BYTES,
    });

    const key = buildTechnicalVisitImageKey(
      technicalVisitId,
      section,
      image.mimetype,
    );

    try {
      await this.storage.upload(image, key);
    } catch (err) {
      const msg = getErrorMessage(err);
      this.logger.error(
        `Falha no upload da imagem da visita ${technicalVisitId}: ${msg}`,
      );
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.STORAGE_UPLOAD_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.STORAGE_UPLOAD_FAILED,
      );
    }

    try {
      const created = await this.imageRepo.create({
        technicalVisit: { connect: { id: technicalVisitId } },
        section,
        imageKey: key,
        originalFilename: image.originalname,
        mimeType: image.mimetype,
        sizeBytes: image.size,
        uploadedBy: actor.id,
        createdBy: actor.id,
        updatedBy: actor.id,
      });

      await this.auditRecorder.record(
        {
          action: AuditAction.CREATE,
          entityType: 'technical_visit_image',
          entityId: created.id,
          after: technicalVisitImageAuditSnapshot(created),
        },
        auditContext,
      );

      return TechnicalVisitImageMapper.toApiRow(this.storage, created);
    } catch (err) {
      try {
        await this.storage.delete(key);
      } catch (cleanupErr) {
        this.logger.error(
          `Falha ao remover objeto órfão ${key}: ${getErrorMessage(cleanupErr)}`,
        );
      }
      throw err;
    }
  }
}
