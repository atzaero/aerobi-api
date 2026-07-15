import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { applyCsvDownloadHeaders } from '@/common/utils/csv-download.util';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { ExportContactsDocs } from '../docs/export-contacts.docs';
import { ExportContactsQueryDTO } from '../dtos/export-contacts-query.dto';
import { ExportContactsService } from '../services/export-contacts.service';
import { resolveContactDate } from '../utils/contact-date.util';

/**
 * `GET /contact/export`. Deve ser registrado **antes** de qualquer handler com
 * `:id` no módulo, senão a rota cai no handler de param. Interno (JWT +
 * `contact:export`, ADMIN).
 */
@ApiTags('Contact')
@Controller('contact')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportContactsController {
  constructor(private readonly service: ExportContactsService) {}

  @Get('export')
  @RequirePermission('contact', 'export')
  @ExportContactsDocs()
  async handle(
    @Query() query: ExportContactsQueryDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const { csv, truncated, total } = await this.service.execute(query);
    applyCsvDownloadHeaders(res, `fale-conosco-${resolveContactDate()}.csv`, {
      truncated,
      total,
    });
    return csv;
  }
}
