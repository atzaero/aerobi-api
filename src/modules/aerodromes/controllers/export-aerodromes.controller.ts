import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { applyCsvDownloadHeaders } from '@/common/utils/csv-download.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ExportAerodromesDocs } from '../docs/export-aerodromes.docs';
import { ExportAerodromesQueryDTO } from '../dtos/export-aerodromes-query.dto';
import { ExportAerodromesService } from '../services/export-aerodromes.service';

/**
 * `GET /aerodromes/export`. Deve ser registrado **antes** do
 * `FindAerodromeByIdController` no módulo, senão a rota cai no handler de `:id`
 * (e `export` falha a validação de UUID). Reusa a permissão `aerodrome:list`
 * (paridade com o web, que dispara o export pelo gate da listagem).
 */
@ApiTags('Aerodromes')
@Controller('aerodromes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportAerodromesController {
  constructor(private readonly service: ExportAerodromesService) {}

  @Get('export')
  @RequirePermission('aerodrome', 'list')
  @ExportAerodromesDocs()
  async handle(
    @Query() query: ExportAerodromesQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const { csv, truncated, total } = await this.service.execute(query, actor);
    applyCsvDownloadHeaders(res, 'aerodromes.csv', { truncated, total });
    return csv;
  }
}
