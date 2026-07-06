import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { ListTasksDocs } from '../docs/list-tasks.docs';
import { ListTasksQueryDTO } from '../dtos/list-tasks-query.dto';
import { TasksPaginatedResponseDTO } from '../dtos/tasks-paginated-response.dto';
import { ListTasksService } from '../services/list-tasks.service';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class ListTasksController {
  constructor(private readonly service: ListTasksService) {}

  @Get()
  @RequirePermission('task', 'list')
  @RequiresGroupScope(GroupScopeSubject.MAINTENANCE, 'maintenanceId')
  @ListTasksDocs()
  handle(
    @Query() query: ListTasksQueryDTO,
  ): Promise<TasksPaginatedResponseDTO> {
    return this.service.execute(query);
  }
}
