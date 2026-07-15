import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { MaintenanceDeletionResponseDTO } from '../dtos/maintenance-response.dto';
import { MaintenanceRepository } from '../repositories/maintenance.repository';
import { maintenanceAuditSnapshot } from '../utils/maintenance-audit';

@Injectable()
export class RemoveMaintenanceService {
  constructor(
    private readonly repo: MaintenanceRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    id: string,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<MaintenanceDeletionResponseDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw resourceNotFound(this.errorMessageService, 'Manutenção', id);
    }

    const { deletedTasks } = await this.repo.softDeleteWithTasks(id, actor.id);

    await this.auditRecorder.record(
      {
        action: AuditAction.DELETE,
        entityType: 'maintenance',
        entityId: id,
        before: maintenanceAuditSnapshot(existing),
        metadata: {
          aerodromeId: existing.aerodromeId,
          uf: existing.aerodrome.group.uf,
          cascadedTasks: deletedTasks,
        },
      },
      auditContext,
    );

    const response = new MaintenanceDeletionResponseDTO();
    response.id = id;
    response.deletedTasks = deletedTasks;
    return response;
  }
}
