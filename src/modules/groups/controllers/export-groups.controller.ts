import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { applyCsvDownloadHeaders } from '@/common/utils/csv-download.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ExportGroupsDocs } from '../docs/export-groups.docs';
import { ExportGroupsQueryDTO } from '../dtos/export-groups-query.dto';
import { ExportGroupsService } from '../services/export-groups.service';

/**
 * `GET /groups/export`. Deve ser registrado **antes** do
 * `FindGroupByIdController` no módulo, senão a rota cai no handler de
 * `:id` (e `export` falha a validação de UUID).
 */
@ApiTags('Groups')
@Controller('groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportGroupsController {
  constructor(private readonly service: ExportGroupsService) {}

  @Get('export')
  @RequirePermission('group', 'export')
  @ExportGroupsDocs()
  async handle(
    @Query() query: ExportGroupsQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const { csv, truncated, total } = await this.service.execute(query, actor);
    applyCsvDownloadHeaders(res, 'groups.csv', { truncated, total });
    return csv;
  }
}
