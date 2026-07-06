import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { TaskDeletionResponseDTO } from '../dtos/task.dto';
import { MaintenanceTaskRepository } from '../repositories/maintenance-task.repository';

@Injectable()
export class RemoveTaskService {
  constructor(
    private readonly taskRepo: MaintenanceTaskRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    id: string,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<TaskDeletionResponseDTO> {
    const existing = await this.taskRepo.findById(id);
    if (!existing) {
      throw resourceNotFound(this.errorMessageService, 'Tarefa', id);
    }

    const { deletedGuesses } = await this.taskRepo.softDelete(id, actor.id);

    await this.auditRecorder.record(
      {
        action: AuditAction.DELETE,
        entityType: 'task',
        entityId: id,
        before: { id: existing.id, title: existing.title },
        metadata: {
          maintenanceId: existing.maintenanceId,
          cascadedGuesses: deletedGuesses,
        },
      },
      auditContext,
    );

    const response = new TaskDeletionResponseDTO();
    response.id = id;
    return response;
  }
}
