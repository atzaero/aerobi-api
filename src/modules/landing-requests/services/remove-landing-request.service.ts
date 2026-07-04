import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { LandingRequestMapper } from '../mappers/landing-request.mapper';
import { LandingRequestRepository } from '../repositories/landing-request.repository';
import { landingRequestAuditSnapshot } from '../utils/landing-request-audit';

/**
 * Soft-delete administrativo de uma solicitação (`landing_request:delete` é
 * ADMIN-only; o escopo por grupo é garantido pelo `GroupScopeGuard` no `:id`).
 * Grava o ator real (`deletedBy = actor.id`, fim do `deletedBy: 'system'`) e a
 * trilha de auditoria (`DELETE`).
 */
@Injectable()
export class RemoveLandingRequestService {
  constructor(
    private readonly repo: LandingRequestRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    id: string,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<LandingRequestResponseDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw resourceNotFound(
        this.errorMessageService,
        'Solicitação de pouso',
        id,
      );
    }

    const deleted = await this.repo.softDelete(id, actor.id);

    await this.auditRecorder.record(
      {
        action: AuditAction.DELETE,
        entityType: 'landing_request',
        entityId: id,
        before: landingRequestAuditSnapshot(existing),
      },
      auditContext,
    );

    return LandingRequestMapper.toApiRow(deleted);
  }
}
