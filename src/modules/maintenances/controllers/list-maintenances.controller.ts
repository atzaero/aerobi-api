import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ListMaintenancesDocs } from '../docs/list-maintenances.docs';
import { ListMaintenancesQueryDTO } from '../dtos/list-maintenances-query.dto';
import { MaintenancesPaginatedResponseDTO } from '../dtos/maintenances-paginated-response.dto';
import { ListMaintenancesService } from '../services/list-maintenances.service';

@ApiTags('Maintenances')
@Controller('maintenances')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ListMaintenancesController {
  constructor(private readonly service: ListMaintenancesService) {}

  @Get()
  @RequirePermission('maintenance', 'list')
  @ListMaintenancesDocs()
  handle(
    @Query() query: ListMaintenancesQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<MaintenancesPaginatedResponseDTO> {
    return this.service.execute(query, actor);
  }
}
