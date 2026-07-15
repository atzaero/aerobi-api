import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { MaintenanceRepository } from '@/modules/maintenances/repositories/maintenance.repository';

import { CreateTaskDTO, CreateTaskResponseDTO } from '../dtos/task.dto';
import { buildTaskCreateInput } from '../mappers/maintenance-task.prisma.mapper';
import { MaintenanceTaskRepository } from '../repositories/maintenance-task.repository';

@Injectable()
export class CreateTaskService {
  constructor(
    private readonly maintenanceRepo: MaintenanceRepository,
    private readonly taskRepo: MaintenanceTaskRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    dto: CreateTaskDTO,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<CreateTaskResponseDTO> {
    const maintenance = await this.maintenanceRepo.findById(dto.maintenanceId);
    if (!maintenance) {
      throw resourceNotFound(
        this.errorMessageService,
        'Manutenção',
        dto.maintenanceId,
      );
    }

    const created = await this.taskRepo.create(
      buildTaskCreateInput({
        dto,
        maintenanceId: dto.maintenanceId,
        actorId: actor.id,
      }),
    );

    await this.auditRecorder.record(
      {
        action: AuditAction.CREATE,
        entityType: 'task',
        entityId: created.id,
        after: {
          id: created.id,
          maintenanceId: created.maintenanceId,
          title: created.title,
        },
        metadata: { aerodromeId: maintenance.aerodromeId },
      },
      auditContext,
    );

    const response = new CreateTaskResponseDTO();
    response.id = created.id;
    response.maintenanceId = created.maintenanceId;
    return response;
  }
}
