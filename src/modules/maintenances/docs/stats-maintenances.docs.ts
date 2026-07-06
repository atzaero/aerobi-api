import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { MaintenancesStatsResponseDTO } from '../dtos/maintenances-stats-response.dto';

export function StatsMaintenancesDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Indicadores do minidashboard de intervenções',
      description:
        'Snapshot agregado para o painel `/maintenances` no web: cobertura de aeródromos, ' +
        'valor previsto (CAPEX/OPEX), atrasos e gráficos por urgência/aeródromo. Sem filtros ' +
        'de listagem — apenas escopo do ator (admin global / coordinator do grupo). ' +
        'Requer `maintenance:list`.',
    }),
    ApiOkResponse({ type: MaintenancesStatsResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `maintenance:list`.' }),
  );
}
