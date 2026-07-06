import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';

import { TaskResponseDTO } from '../dtos/task.dto';
import { MaintenanceTaskMapper } from '../mappers/maintenance-task.mapper';
import { MaintenanceTaskRepository } from '../repositories/maintenance-task.repository';

@Injectable()
export class FindTaskByIdService {
  constructor(
    private readonly taskRepo: MaintenanceTaskRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(id: string): Promise<TaskResponseDTO> {
    const task = await this.taskRepo.findById(id);
    if (!task) {
      throw resourceNotFound(this.errorMessageService, 'Tarefa', id);
    }

    const counts = await this.taskRepo.countActiveGuessesByTaskIds([id]);
    return MaintenanceTaskMapper.toApiRow(task, counts.get(id));
  }
}
