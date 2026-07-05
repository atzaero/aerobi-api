import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { applyCsvDownloadHeaders } from '@/common/utils/csv-download.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ExportLandingRequestsDocs } from '../docs/export-landing-requests.docs';
import { ExportLandingRequestsQueryDTO } from '../dtos/export-landing-requests-query.dto';
import { ExportLandingRequestsService } from '../services/export-landing-requests.service';

/**
 * `GET /landing-requests/export` — export CSV da moderação. Registrado **antes**
 * do `FindLandingRequestByIdController` no módulo, senão `export` cai no handler
 * de `:id` (Express 5). Interno (JWT + `landing_request:export`, escopo por
 * grupo aplicado no service).
 */
@ApiTags('Landing Requests')
@Controller('landing-requests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportLandingRequestsController {
  constructor(private readonly service: ExportLandingRequestsService) {}

  @Get('export')
  @RequirePermission('landing_request', 'export')
  @ExportLandingRequestsDocs()
  async handle(
    @Query() query: ExportLandingRequestsQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const { csv, truncated, total } = await this.service.execute(query, actor);
    const date = new Date().toISOString().slice(0, 10);
    applyCsvDownloadHeaders(res, `solicitacoes-pouso-${date}.csv`, {
      truncated,
      total,
    });
    return csv;
  }
}
