import { applyDecorators } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

import { GeojsonForAerodromeResponseDTO } from '../dtos/geojson-for-aerodrome-response.dto';

export function FindVisibleGeojsonByAerodromeIdDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Busca GeoJSON visível por aeródromo (mapa)',
      description:
        'Consulta pública autenticada com `X-API-Key`. Retorna o GeoJSON do ' +
        'aeródromo ativo com `isView=true`. Sem JWT/RBAC. Oculto / soft-deletado ' +
        '/ inexistente → 404.',
    }),
    ApiParam({
      name: 'aerodromeId',
      format: 'uuid',
      description: 'Identificador do aeródromo',
    }),
    ApiOkResponse({ type: GeojsonForAerodromeResponseDTO }),
    ApiUnauthorizedResponse({ description: 'X-API-Key ausente ou inválida.' }),
    ApiNotFoundResponse({
      description:
        'Inexistente, soft-deletado, sem GeoJSON ou não visível (`isView !== true`).',
    }),
    ApiUnprocessableEntityResponse({
      description: 'GeoJSON existe mas não está pronto (`status ≠ READY`).',
    }),
    /**
     * 502 herdado do JWT `FindGeojsonForAerodromeService` (paridade de contrato).
     * Representa dado interno inconsistente (READY com geoJson inválido), não
     * falha de upstream HTTP — manter até eventual PR unificar o status.
     */
    ApiBadGatewayResponse({
      description:
        'GeoJSON marcado READY mas com conteúdo ausente/inválido (paridade com GET /geojsons/aerodrome/:id).',
    }),
  );
}
