import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { applyCsvDownloadHeaders } from '@/common/utils/csv-download.util';

import { ExportMovementsDocs } from '../docs/export-movements.docs';
import { ExportMovementsQueryDTO } from '../dtos/export-movements-query.dto';
import { ExportMovementsService } from '../services/export-movements.service';

/**
 * Rota canônica `GET /movements/export` — exporta os movimentos filtrados em
 * CSV. Registrada **antes** de `GET /movements/:movementId` no módulo (Express 5
 * casa `/export` como se fosse um id caso contrário); invariante travada em
 * `movements.module.spec`.
 */
@ApiTags('Movements')
@Controller('movements')
@UseGuards(AerobiApiKeyGuard)
export class ExportMovementsController {
  constructor(private readonly service: ExportMovementsService) {}

  @Get('export')
  @ExportMovementsDocs()
  async handle(
    @Query() query: ExportMovementsQueryDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const { csv, truncated, total } = await this.service.execute(query);
    applyCsvDownloadHeaders(res, 'movements.csv', { truncated, total });
    return csv;
  }
}
