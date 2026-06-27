import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ExportAerodromeGroupsDocs } from '../docs/export-aerodrome-groups.docs';
import { ExportAerodromeGroupsQueryDTO } from '../dtos/export-aerodrome-groups-query.dto';
import { ExportAerodromeGroupsService } from '../services/export-aerodrome-groups.service';

/**
 * `GET /aerodrome-groups/export`. Deve ser registrado **antes** do
 * `FindAerodromeGroupByIdController` no módulo, senão a rota cai no handler de
 * `:id` (e `export` falha a validação de UUID).
 */
@ApiTags('Aerodrome Groups')
@Controller('aerodrome-groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportAerodromeGroupsController {
  constructor(private readonly service: ExportAerodromeGroupsService) {}

  /**
   * Os headers de download são setados **dentro do handler**, só depois do
   * service resolver — nunca via `@Header`, que o Nest aplica antes de executar
   * o handler. Se o service lançar, os headers não chegam a ser setados e o
   * `AllExceptionsFilter` responde JSON com `Content-Type: application/json`
   * (o Express só preenche o Content-Type quando ainda não há um), em vez de
   * entregar o corpo de erro como `text/csv` attachment.
   */
  @Get('export')
  @RequirePermission('group', 'export')
  @ExportAerodromeGroupsDocs()
  async handle(
    @Query() query: ExportAerodromeGroupsQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const { csv, truncated, total } = await this.service.execute(query, actor);
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="aerodrome-groups.csv"',
    });
    /**
     * Sinaliza o corte no teto (#392): o CSV tem só `EXPORT_MAX_ROWS` linhas das
     * `total` que casam o filtro. A UI usa isto para avisar e orientar a refinar
     * o filtro, em vez de tratar o arquivo como o dataset completo. Os headers
     * são expostos via CORS em `apply-cors.ts`.
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
