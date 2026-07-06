import type { MaintenanceTask } from '@/generated/prisma/client';

import { TaskResponseDTO } from '../dtos/task.dto';

import {
  decimalToApiNumber,
  investmentTypeToApi,
  taskFollowUpToApi,
  taskStatusToApi,
  taskUrgencyToApi,
} from './maintenance-task.prisma.mapper';

export class MaintenanceTaskMapper {
  static toApiRow(
    entity: MaintenanceTask,
    suggestionCount?: number,
  ): TaskResponseDTO {
    const row = new TaskResponseDTO();
    row.id = entity.id;
    row.maintenanceId = entity.maintenanceId;
    row.title = entity.title;
    row.description = entity.description;
    row.predictedValue = decimalToApiNumber(entity.predictedValue) ?? 0;
    row.insertionDate = entity.insertionDate.toISOString();
    row.predictedDate = entity.predictedDate.toISOString();
    row.completionDate = entity.completionDate?.toISOString() ?? null;
    row.actualCost = decimalToApiNumber(entity.actualCost);
    row.completionDescription = entity.completionDescription;
    row.impact = entity.impact;
    row.timeElapsed = entity.timeElapsed;
    row.status = taskStatusToApi(entity.status);
    row.urgency = taskUrgencyToApi(entity.urgency);
    row.followUp = taskFollowUpToApi(entity.followUp);
    row.investmentType = investmentTypeToApi(entity.investmentType);
    row.responsibility = entity.responsibility;
    row.delayWarning = entity.delayWarning;
    row.createdAt = entity.createdAt.toISOString();
    row.updatedAt = entity.updatedAt.toISOString();
    if (suggestionCount !== undefined) {
      row.suggestionCount = suggestionCount;
    }
    return row;
  }

  static toApiRows(
    entities: MaintenanceTask[],
    suggestionCounts?: Map<string, number>,
  ): TaskResponseDTO[] {
    return entities.map((entity) =>
      MaintenanceTaskMapper.toApiRow(entity, suggestionCounts?.get(entity.id)),
    );
  }
}
