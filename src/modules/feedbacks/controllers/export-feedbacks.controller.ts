import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { applyCsvDownloadHeaders } from '@/common/utils/csv-download.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ExportFeedbacksDocs } from '../docs/export-feedbacks.docs';
import { ExportFeedbacksQueryDTO } from '../dtos/export-feedbacks-query.dto';
import { ExportFeedbacksService } from '../services/export-feedbacks.service';

/**
 * `GET /feedbacks/export` — export CSV da moderação. Deve ser
 * registrado **antes** do `FindFeedbackByIdController` no módulo, senão
 * `export` cai no handler de `:id`. Interno (JWT + `feedback:export`, escopo por
 * grupo aplicado no service).
 */
@ApiTags('Feedbacks')
@Controller('feedbacks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportFeedbacksController {
  constructor(private readonly service: ExportFeedbacksService) {}

  @Get('export')
  @RequirePermission('feedback', 'export')
  @ExportFeedbacksDocs()
  async handle(
    @Query() query: ExportFeedbacksQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const { csv, truncated, total } = await this.service.execute(query, actor);
    applyCsvDownloadHeaders(res, 'feedbacks.csv', {
      truncated,
      total,
    });
    return csv;
  }
}
