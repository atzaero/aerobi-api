import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { applyCsvDownloadHeaders } from '@/common/utils/csv-download.util';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { ExportAuditLogsDocs } from '../docs/export-audit-logs.docs';
import { ExportAuditLogsQueryDto } from '../dtos/export-audit-logs-query.dto';
import { ExportAuditLogsService } from '../services/export-audit-logs.service';

/**
 * `GET /audit-logs/export`. Deve ser registrado **antes** do
 * `FindAuditLogByIdController` no módulo, senão a rota cai no handler de `:id`
 * (e `export` falha a validação de UUID).
 */
@ApiTags('Audit')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportAuditLogsController {
  constructor(private readonly service: ExportAuditLogsService) {}

  @Get('export')
  @RequirePermission('audit', 'export')
  @ExportAuditLogsDocs()
  async handle(
    @Query() query: ExportAuditLogsQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const { csv, truncated, total } = await this.service.execute(query);
    const filename = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
    applyCsvDownloadHeaders(res, filename, { truncated, total });
    return csv;
  }
}
