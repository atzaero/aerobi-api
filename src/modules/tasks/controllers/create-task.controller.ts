import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
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

import { CreateTaskDocs } from '../docs/create-task.docs';
import { CreateTaskDTO, CreateTaskResponseDTO } from '../dtos/task.dto';
import { CreateTaskService } from '../services/create-task.service';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class CreateTaskController {
  constructor(private readonly service: CreateTaskService) {}

  @Post()
  @RequirePermission('task', 'create')
  @RequiresGroupScope(GroupScopeSubject.MAINTENANCE, 'maintenanceId')
  @CreateTaskDocs()
  handle(
    @Body() dto: CreateTaskDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<CreateTaskResponseDTO> {
    return this.service.execute(dto, actor, buildAuditContext(actor, request));
  }
}
