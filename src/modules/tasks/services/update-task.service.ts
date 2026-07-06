import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { TaskResponseDTO } from '../dtos/task.dto';
import { UpdateTaskDTO } from '../dtos/task.dto';
import { MaintenanceTaskMapper } from '../mappers/maintenance-task.mapper';
import { buildTaskUpdateInput } from '../mappers/maintenance-task.prisma.mapper';
import { MaintenanceTaskRepository } from '../repositories/maintenance-task.repository';

@Injectable()
export class UpdateTaskService {
  constructor(
    private readonly taskRepo: MaintenanceTaskRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    id: string,
    dto: UpdateTaskDTO,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<TaskResponseDTO> {
    const existing = await this.taskRepo.findById(id);
    if (!existing) {
      throw resourceNotFound(this.errorMessageService, 'Tarefa', id);
    }

    const updated = await this.taskRepo.update(
      id,
      buildTaskUpdateInput({ dto, actorId: actor.id }),
    );

    await this.auditRecorder.record(
      {
        action: AuditAction.UPDATE,
        entityType: 'task',
        entityId: id,
        before: {
          id: existing.id,
          title: existing.title,
          status: existing.status,
        },
        after: { id: updated.id, title: updated.title, status: updated.status },
        metadata: { maintenanceId: updated.maintenanceId },
      },
      auditContext,
    );

    return MaintenanceTaskMapper.toApiRow(updated);
  }
}
