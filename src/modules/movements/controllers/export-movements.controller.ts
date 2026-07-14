import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { applyCsvDownloadHeaders } from '@/common/utils/csv-download.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ExportMovementsDocs } from '../docs/export-movements.docs';
import { ExportMovementsQueryDTO } from '../dtos/export-movements-query.dto';
import { ExportMovementsService } from '../services/export-movements.service';

/**
 * Rota canônica `GET /movements/export` — exporta os movimentos filtrados em
 * CSV. Registrada **antes** de `GET /movements/:movementId` no módulo (Express 5
 * casa `/export` como se fosse um id caso contrário); invariante travada em
 * `movements.module.spec`. Mesmo gate/escopo da listagem (`movement:export`).
 */
@ApiTags('Movements')
@Controller('movements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportMovementsController {
  constructor(private readonly service: ExportMovementsService) {}

  @Get('export')
  @RequirePermission('movement', 'export')
  @ExportMovementsDocs()
  async handle(
    @Query() query: ExportMovementsQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const { csv, truncated, total } = await this.service.execute(query, actor);
    applyCsvDownloadHeaders(res, 'movements.csv', { truncated, total });
    return csv;
  }
}
