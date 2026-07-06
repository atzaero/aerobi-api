import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { TaskParamDTO } from '../dtos/task-param.dto';
import { TaskResponseDTO } from '../dtos/task.dto';
import { FindTaskByIdDocs } from '../docs/find-task-by-id.docs';
import { FindTaskByIdService } from '../services/find-task-by-id.service';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class FindTaskByIdController {
  constructor(private readonly service: FindTaskByIdService) {}

  @Get(':id')
  @RequirePermission('task', 'read')
  @RequiresGroupScope(GroupScopeSubject.TASK)
  @FindTaskByIdDocs()
  handle(@Param() { id }: TaskParamDTO): Promise<TaskResponseDTO> {
    return this.service.execute(id);
  }
}
