import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { GeojsonForAerodromeResponseDTO } from '../dtos/geojson-for-aerodrome-response.dto';

export function ListVisibleGeojsonsDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Lista GeoJSONs visíveis (mapa)',
      description:
        'Consulta pública autenticada com `X-API-Key`. Retorna **todos** os ' +
        'GeoJSONs READY de aeródromos ativos com `isView=true` (array completo, ' +
        'sem paginação) para popular o mapa. Sem JWT/RBAC. Itens com `geoJson` ' +
        'inválido são omitidos.',
    }),
    ApiOkResponse({
      description: 'Array completo de GeoJSONs visíveis READY.',
      type: GeojsonForAerodromeResponseDTO,
      isArray: true,
    }),
    ApiUnauthorizedResponse({ description: 'X-API-Key ausente ou inválida.' }),
  );
}
