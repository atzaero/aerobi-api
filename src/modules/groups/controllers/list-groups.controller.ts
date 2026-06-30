import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ListGroupsDocs } from '../docs/list-groups.docs';
import { ListGroupsQueryDTO } from '../dtos/list-groups-query.dto';
import { GroupsPaginatedResponseDTO } from '../dtos/groups-paginated-response.dto';
import { ListGroupsService } from '../services/list-groups.service';

@ApiTags('Groups')
@Controller('groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ListGroupsController {
  constructor(private readonly service: ListGroupsService) {}

  @Get()
  @RequirePermission('group', 'list')
  @ListGroupsDocs()
  handle(
    @Query() query: ListGroupsQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<GroupsPaginatedResponseDTO> {
    return this.service.execute(query, actor);
  }
}
