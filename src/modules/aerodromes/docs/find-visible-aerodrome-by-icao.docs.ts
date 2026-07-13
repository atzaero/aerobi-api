import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AerodromePublicResponseDTO } from '../dtos/aerodrome-public-response.dto';

export function FindVisibleAerodromeByIcaoDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Busca aeródromo visível por ICAO (ficha pública)',
      description:
        'Consulta pública autenticada com `X-API-Key`. Retorna a ficha do aeródromo ativo com `isView=true` e ICAO informado, incluindo `geojson` aninhado (layer READY) ou `null`. Substitui `GET /geojsons/visible/:aerodromeId` (#546) — cutover no aerobi-web deve ser atômico. Sem JWT/RBAC.',
    }),
    ApiParam({
      name: 'icao',
      description: 'Código ICAO (4 caracteres alfanuméricos)',
      example: 'SJ4E',
    }),
    ApiOkResponse({ type: AerodromePublicResponseDTO }),
    ApiUnauthorizedResponse({ description: 'X-API-Key ausente ou inválida.' }),
    ApiNotFoundResponse({
      description:
        'Inexistente, soft-deletado ou não visível (`isView !== true`).',
    }),
  );
}
