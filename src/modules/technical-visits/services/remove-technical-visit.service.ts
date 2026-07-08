import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { technicalVisitAuditSnapshot } from '../utils/technical-visit-audit';
import { toTechnicalVisitApiRow } from '../utils/technical-visit-response';

@Injectable()
export class RemoveTechnicalVisitService {
  constructor(
    private readonly repo: TechnicalVisitRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    id: string,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<TechnicalVisitResponseDTO> {
    const existing = await this.repo.findByIdWithAerodrome(id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Visita técnica',
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    const before = technicalVisitAuditSnapshot(existing);
    const deleted = await this.repo.softDelete(id, actor.id);

    await this.auditRecorder.record(
      {
        action: AuditAction.DELETE,
        entityType: 'technical_visit',
        entityId: id,
        before,
      },
      auditContext,
    );

    return toTechnicalVisitApiRow(this.userRepository, {
      ...existing,
      deletedAt: deleted.deletedAt,
      deletedBy: deleted.deletedBy,
      updatedAt: deleted.updatedAt,
      updatedBy: deleted.updatedBy,
    });
  }
}
