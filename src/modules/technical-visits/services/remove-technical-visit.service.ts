import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
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
      throw resourceNotFound(this.errorMessageService, 'Visita técnica', id);
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
