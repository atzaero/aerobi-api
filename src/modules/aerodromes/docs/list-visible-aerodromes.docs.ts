import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AerodromePublicResponseDTO } from '../dtos/aerodrome-public-response.dto';

export function ListVisibleAerodromesDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Lista aeródromos visíveis (mapa)',
      description:
        'Consulta pública autenticada com `X-API-Key`. Retorna **todos** os aeródromos ativos com `isView=true` (array completo, sem paginação) para popular o mapa, cada um com `geojson` aninhado (layer READY) ou `null`. Payload pode ser grande (FeatureCollections) — preferir compressão HTTP. Sem JWT/RBAC.',
    }),
    ApiOkResponse({
      description: 'Array completo de aeródromos visíveis.',
      type: AerodromePublicResponseDTO,
      isArray: true,
    }),
    ApiUnauthorizedResponse({ description: 'X-API-Key ausente ou inválida.' }),
  );
}
