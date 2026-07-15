import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';

import { TechnicalVisitImageResponseDTO } from '../dtos/technical-visit-image-response.dto';
import { TechnicalVisitImageMapper } from '../mappers/technical-visit-image.mapper';
import { TechnicalVisitImageRepository } from '../repositories/technical-visit-image.repository';
import { technicalVisitImageAuditSnapshot } from '../utils/technical-visit-image-audit';

@Injectable()
export class RemoveTechnicalVisitImageService {
  constructor(
    private readonly imageRepo: TechnicalVisitImageRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  /**
   * Soft-delete da imagem no banco; o objeto MinIO permanece (cleanup órfãos é follow-up #369).
   */
  async execute(
    technicalVisitId: string,
    imageId: string,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<TechnicalVisitImageResponseDTO> {
    const image = await this.imageRepo.findById(imageId);
    if (!image || image.technicalVisitId !== technicalVisitId) {
      throw resourceNotFound(
        this.errorMessageService,
        'Imagem da visita técnica',
        imageId,
      );
    }

    const before = technicalVisitImageAuditSnapshot(image);
    const deleted = await this.imageRepo.softDelete(imageId, actor.id);

    await this.auditRecorder.record(
      {
        action: AuditAction.DELETE,
        entityType: 'technical_visit_image',
        entityId: imageId,
        before,
      },
      auditContext,
    );

    return TechnicalVisitImageMapper.toApiRow(this.storage, deleted);
  }
}
