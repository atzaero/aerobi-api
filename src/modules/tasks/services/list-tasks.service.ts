import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { MaintenanceRepository } from '@/modules/maintenances/repositories/maintenance.repository';

import { ListTasksQueryDTO } from '../dtos/list-tasks-query.dto';
import { TasksPaginatedResponseDTO } from '../dtos/tasks-paginated-response.dto';
import { MaintenanceTaskMapper } from '../mappers/maintenance-task.mapper';
import { MaintenanceTaskRepository } from '../repositories/maintenance-task.repository';
import {
  filterMaintenanceTasks,
  sortMaintenanceTasks,
} from '../utils/filter-maintenance-tasks';

const MAX_LIMIT = 200;

@Injectable()
export class ListTasksService {
  constructor(
    private readonly maintenanceRepo: MaintenanceRepository,
    private readonly taskRepo: MaintenanceTaskRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(query: ListTasksQueryDTO): Promise<TasksPaginatedResponseDTO> {
    const maintenance = await this.maintenanceRepo.findById(
      query.maintenanceId,
    );
    if (!maintenance) {
      throw resourceNotFound(
        this.errorMessageService,
        'Manutenção',
        query.maintenanceId,
      );
    }

    const { page, limit } = resolvePaginationParams(query, MAX_LIMIT);
    const tasks = await this.taskRepo.findManyByMaintenanceId(
      query.maintenanceId,
    );
    const suggestionCounts = await this.taskRepo.countActiveGuessesByTaskIds(
      tasks.map((t) => t.id),
    );

    let filtered = filterMaintenanceTasks(tasks, query, suggestionCounts);
    filtered = sortMaintenanceTasks(filtered);

    const total = filtered.length;
    const pageData = filtered.slice((page - 1) * limit, page * limit);

    return new TasksPaginatedResponseDTO(
      MaintenanceTaskMapper.toApiRows(pageData, suggestionCounts),
      page,
      limit,
      total,
    );
  }
}
