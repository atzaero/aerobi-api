import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { MaintenancesStatsResponseDTO } from '../dtos/maintenances-stats-response.dto';
import { StatsMaintenancesDocs } from '../docs/stats-maintenances.docs';
import { StatsMaintenancesService } from '../services/stats-maintenances.service';

@ApiTags('Maintenances')
@Controller('maintenances')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StatsMaintenancesController {
  constructor(private readonly service: StatsMaintenancesService) {}

  @Get('stats')
  @RequirePermission('maintenance', 'list')
  @StatsMaintenancesDocs()
  handle(
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<MaintenancesStatsResponseDTO> {
    return this.service.execute(actor);
  }
}
