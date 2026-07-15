import { Controller, Delete, Param, Req, UseGuards } from '@nestjs/common';
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
import { TaskDeletionResponseDTO } from '../dtos/task.dto';
import { RemoveTaskDocs } from '../docs/remove-task.docs';
import { RemoveTaskService } from '../services/remove-task.service';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class RemoveTaskController {
  constructor(private readonly service: RemoveTaskService) {}

  @Delete(':id')
  @RequirePermission('task', 'delete')
  @RequiresGroupScope(GroupScopeSubject.TASK)
  @RemoveTaskDocs()
  handle(
    @Param() { id }: TaskParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<TaskDeletionResponseDTO> {
    return this.service.execute(id, actor, buildAuditContext(actor, request));
  }
}
