import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

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

  /**
   * Os headers de download são setados **dentro do handler**, só depois do
   * service resolver — nunca via `@Header`, que o Nest aplica antes de executar o
   * handler. Se o service lançar, os headers não chegam a ser setados e o
   * `AllExceptionsFilter` responde JSON, em vez de entregar o corpo de erro como
   * `text/csv` attachment.
   */
  @Get('export')
  @RequirePermission('aerodrome', 'list')
  @ExportAerodromesDocs()
  async handle(
    @Query() query: ExportAerodromesQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const { csv, truncated, total } = await this.service.execute(query, actor);
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="aerodromes.csv"',
    });
    /**
     * Sinaliza o corte no teto: o CSV tem só `EXPORT_MAX_ROWS` linhas das `total`
     * que casam o filtro. A UI usa isto para avisar e orientar a refinar o
     * filtro. Os headers são expostos via CORS em `apply-cors.ts`.
     */
    if (truncated) {
      res.set({
        'X-Export-Truncated': 'true',
        'X-Export-Total': String(total),
      });
    }
    return csv;
  }
}
