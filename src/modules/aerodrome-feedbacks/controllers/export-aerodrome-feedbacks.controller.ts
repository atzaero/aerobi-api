import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { applyCsvDownloadHeaders } from '@/common/utils/csv-download.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ExportAerodromeFeedbacksDocs } from '../docs/export-aerodrome-feedbacks.docs';
import { ExportAerodromeFeedbacksQueryDTO } from '../dtos/export-aerodrome-feedbacks-query.dto';
import { ExportAerodromeFeedbacksService } from '../services/export-aerodrome-feedbacks.service';

/**
 * `GET /aerodrome-feedbacks/export` — export CSV da moderação. Deve ser
 * registrado **antes** do `FindAerodromeFeedbackByIdController` no módulo, senão
 * `export` cai no handler de `:id`. Interno (JWT + `feedback:export`, escopo por
 * grupo aplicado no service).
 */
@ApiTags('Aerodrome Feedbacks')
@Controller('aerodrome-feedbacks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportAerodromeFeedbacksController {
  constructor(private readonly service: ExportAerodromeFeedbacksService) {}

  @Get('export')
  @RequirePermission('feedback', 'export')
  @ExportAerodromeFeedbacksDocs()
  async handle(
    @Query() query: ExportAerodromeFeedbacksQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const { csv, truncated, total } = await this.service.execute(query, actor);
    applyCsvDownloadHeaders(res, 'aerodrome-feedbacks.csv', {
      truncated,
      total,
    });
    return csv;
  }
}
