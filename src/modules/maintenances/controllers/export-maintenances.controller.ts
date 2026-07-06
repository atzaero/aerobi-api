import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { applyCsvDownloadHeaders } from '@/common/utils/csv-download.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ExportMaintenancesQueryDTO } from '../dtos/export-maintenances-query.dto';
import { ExportMaintenancesDocs } from '../docs/export-maintenances.docs';
import { ExportMaintenancesService } from '../services/export-maintenances.service';

@ApiTags('Maintenances')
@Controller('maintenances')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportMaintenancesController {
  constructor(private readonly service: ExportMaintenancesService) {}

  @Get('export')
  @RequirePermission('maintenance', 'export')
  @ExportMaintenancesDocs()
  async handle(
    @Query() query: ExportMaintenancesQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const { csv, truncated, total } = await this.service.execute(query, actor);
    applyCsvDownloadHeaders(res, 'maintenances.csv', { truncated, total });
    return csv;
  }
}
