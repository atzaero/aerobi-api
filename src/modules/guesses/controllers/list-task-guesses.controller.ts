import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { ListTaskGuessesDocs } from '../docs/list-task-guesses.docs';
import { GuessListItemResponseDTO } from '../dtos/guess.dto';
import { ListTaskGuessesQueryDTO } from '../dtos/list-task-guesses-query.dto';
import { TaskGuessesParamDTO } from '../dtos/task-guesses-param.dto';
import { ListTaskGuessesService } from '../services/list-task-guesses.service';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class ListTaskGuessesController {
  constructor(private readonly service: ListTaskGuessesService) {}

  @Get(':taskId/guesses')
  @RequirePermission('task', 'read')
  @RequiresGroupScope(GroupScopeSubject.TASK, 'taskId')
  @ListTaskGuessesDocs()
  handle(
    @Param() { taskId }: TaskGuessesParamDTO,
    @Query() query: ListTaskGuessesQueryDTO,
  ): Promise<GuessListItemResponseDTO[]> {
    return this.service.execute(taskId, query);
  }
}
