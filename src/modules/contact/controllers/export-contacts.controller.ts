import { Controller, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { ExportContactsDocs } from '../docs/export-contacts.docs';
import { ExportContactsQueryDTO } from '../dtos/export-contacts-query.dto';
import { resolveContactDate } from '../utils/contact-date.util';
import { ExportContactsService } from '../services/export-contacts.service';

@ApiTags('Contact')
@Controller('contact')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportContactsController {
  constructor(private readonly service: ExportContactsService) {}

  @ExportContactsDocs()
  @RequirePermission('contact', 'export')
  async handle(
    @Query() query: ExportContactsQueryDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const { csv, truncated, total } = await this.service.execute(query);
    const today = resolveContactDate();
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="fale-conosco-${today}.csv"`,
    });
    if (truncated) {
      res.set({
        'X-Export-Truncated': 'true',
        'X-Export-Total': String(total),
      });
    }
    return csv;
  }
}
