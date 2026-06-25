import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ListAerodromeGroupsDocs } from '../docs/list-aerodrome-groups.docs';
import { ListAerodromeGroupsQueryDTO } from '../dtos/list-aerodrome-groups-query.dto';
import { AerodromeGroupsPaginatedResponseDTO } from '../dtos/aerodrome-groups-paginated-response.dto';
import { ListAerodromeGroupsService } from '../services/list-aerodrome-groups.service';

@ApiTags('Aerodrome Groups')
@Controller('aerodrome-groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ListAerodromeGroupsController {
  constructor(private readonly service: ListAerodromeGroupsService) {}

  @Get()
  @RequirePermission('group', 'list')
  @ListAerodromeGroupsDocs()
  handle(
    @Query() query: ListAerodromeGroupsQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AerodromeGroupsPaginatedResponseDTO> {
    return this.service.execute(query, actor);
  }
}
