import { Body, Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { buildAuditContext } from '@/modules/audit/utils/audit-context.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { TaskParamDTO } from '../dtos/task-param.dto';
import { TaskResponseDTO, UpdateTaskDTO } from '../dtos/task.dto';
import { UpdateTaskDocs } from '../docs/update-task.docs';
import { UpdateTaskService } from '../services/update-task.service';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class UpdateTaskController {
  constructor(private readonly service: UpdateTaskService) {}

  @Patch(':id')
  @RequirePermission('task', 'update')
  @RequiresGroupScope(GroupScopeSubject.TASK)
  @UpdateTaskDocs()
  handle(
    @Param() { id }: TaskParamDTO,
    @Body() dto: UpdateTaskDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<TaskResponseDTO> {
    return this.service.execute(
      id,
      dto,
      actor,
      buildAuditContext(actor, request),
    );
  }
}
