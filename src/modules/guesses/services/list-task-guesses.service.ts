import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { MaintenanceTaskRepository } from '@/modules/tasks/repositories/maintenance-task.repository';

import { GuessListItemResponseDTO } from '../dtos/guess.dto';
import { ListTaskGuessesQueryDTO } from '../dtos/list-task-guesses-query.dto';
import {
  filterTaskGuesses,
  MaintenanceGuessMapper,
} from '../mappers/maintenance-guess.mapper';
import { MaintenanceGuessRepository } from '../repositories/maintenance-guess.repository';

@Injectable()
export class ListTaskGuessesService {
  constructor(
    private readonly taskRepo: MaintenanceTaskRepository,
    private readonly guessRepo: MaintenanceGuessRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    taskId: string,
    query: ListTaskGuessesQueryDTO,
  ): Promise<GuessListItemResponseDTO[]> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) {
      throw resourceNotFound(this.errorMessageService, 'Tarefa', taskId);
    }

    const guesses = await this.guessRepo.findActiveByTaskId(taskId);
    const items = MaintenanceGuessMapper.toListItems(guesses);
    return filterTaskGuesses(items, query);
  }
}
