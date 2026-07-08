import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import {
  assertAerodromeInScope,
  resolveOperationalActorScope,
} from '@/common/utils/group-scope.util';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { CreateMaintenanceDTO } from '../dtos/create-maintenance.dto';
import { CreateMaintenanceResponseDTO } from '../dtos/maintenance-response.dto';
import {
  MAINTENANCE_INVITED_EVENT,
  MaintenanceInvitedEvent,
} from '../events/maintenance-invited.event';
import { buildMaintenanceCreateInput } from '../mappers/maintenance.prisma.mapper';
import { MaintenanceRepository } from '../repositories/maintenance.repository';
import { maintenanceAuditSnapshot } from '../utils/maintenance-audit';
import { normalizeAuthorizedEmails } from '../utils/normalize-authorized-emails';

@Injectable()
export class CreateMaintenanceService {
  constructor(
    private readonly repo: MaintenanceRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    dto: CreateMaintenanceDTO,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<CreateMaintenanceResponseDTO> {
    const scope = await resolveOperationalActorScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );
    const aerodrome = assertAerodromeInScope(
      await this.repo.findActiveAerodrome(dto.aerodromeId),
      scope,
      this.errorMessageService,
      dto.aerodromeId,
    );

    const created = await this.repo.create(
      buildMaintenanceCreateInput({
        dto,
        actorId: actor.id,
        aerodromeId: dto.aerodromeId,
      }),
    );

    await this.auditRecorder.record(
      {
        action: AuditAction.CREATE,
        entityType: 'maintenance',
        entityId: created.id,
        after: maintenanceAuditSnapshot(created),
        metadata: {
          aerodromeId: created.aerodromeId,
          uf: aerodrome.group.uf,
        },
      },
      auditContext,
    );

    const authorizedEmails = normalizeAuthorizedEmails(
      dto.authorizedEmails ?? [],
    );
    if (authorizedEmails.length > 0 && created.securityCode) {
      this.eventEmitter.emit(
        MAINTENANCE_INVITED_EVENT,
        new MaintenanceInvitedEvent(
          created.id,
          created.aerodromeId,
          authorizedEmails,
          created.securityCode,
        ),
      );
    }

    const response = new CreateMaintenanceResponseDTO();
    response.id = created.id;
    response.aerodromeId = created.aerodromeId;
    response.securityCode = created.securityCode;
    return response;
  }
}
