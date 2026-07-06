import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { UpdateMaintenanceResponseDTO } from '../dtos/maintenance-response.dto';
import { UpdateMaintenanceDTO } from '../dtos/update-maintenance.dto';
import {
  MAINTENANCE_INVITED_EVENT,
  MaintenanceInvitedEvent,
} from '../events/maintenance-invited.event';
import { buildMaintenanceUpdateInput } from '../mappers/maintenance.prisma.mapper';
import { MaintenanceRepository } from '../repositories/maintenance.repository';
import { maintenanceAuditSnapshot } from '../utils/maintenance-audit';
import { diffAddedEmails } from '../utils/diff-added-emails';
import { normalizeAuthorizedEmails } from '../utils/normalize-authorized-emails';

@Injectable()
export class UpdateMaintenanceService {
  constructor(
    private readonly repo: MaintenanceRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    id: string,
    dto: UpdateMaintenanceDTO,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<UpdateMaintenanceResponseDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw resourceNotFound(this.errorMessageService, 'Manutenção', id);
    }

    const beforeCode = existing.securityCode?.trim() ?? '';
    const regenerateSecurityCode = dto.regenerateSecurityCode ?? false;

    const updated = await this.repo.update(
      id,
      buildMaintenanceUpdateInput({
        dto,
        actorId: actor.id,
        currentSecurityCode: existing.securityCode,
        regenerateSecurityCode,
      }),
    );

    const afterCode = updated.securityCode?.trim() ?? '';
    const securityCodeChanged = beforeCode !== afterCode;
    const authorizedEmails = normalizeAuthorizedEmails(
      dto.authorizedEmails ?? [],
    );

    await this.auditRecorder.record(
      {
        action: AuditAction.UPDATE,
        entityType: 'maintenance',
        entityId: id,
        before: maintenanceAuditSnapshot(existing),
        after: maintenanceAuditSnapshot(updated),
        metadata: {
          aerodromeId: existing.aerodromeId,
          uf: existing.aerodrome.group.uf,
          securityCodeRegenerated:
            regenerateSecurityCode || securityCodeChanged,
        },
      },
      auditContext,
    );

    const shouldResendAll =
      regenerateSecurityCode || !beforeCode || securityCodeChanged;
    const recipients =
      afterCode.length > 0
        ? shouldResendAll
          ? authorizedEmails
          : diffAddedEmails(existing.authorizedEmails, authorizedEmails)
        : [];

    if (recipients.length > 0 && updated.securityCode) {
      this.eventEmitter.emit(
        MAINTENANCE_INVITED_EVENT,
        new MaintenanceInvitedEvent(
          updated.id,
          updated.aerodromeId,
          recipients,
          updated.securityCode,
        ),
      );
    }

    const response = new UpdateMaintenanceResponseDTO();
    response.id = updated.id;
    response.securityCode = updated.securityCode;
    return response;
  }
}
