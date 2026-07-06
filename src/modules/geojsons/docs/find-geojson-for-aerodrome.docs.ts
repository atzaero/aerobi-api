import { applyDecorators } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

import { GeojsonForAerodromeResponseDTO } from '../dtos/geojson-for-aerodrome-response.dto';

export function FindGeojsonForAerodromeDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Lê o GeoJSON de um aeródromo (mapa)',
      description:
        'Requer `aerodrome:read`. O `:id` é o **aerodromeId** (escopo por grupo ' +
        'do aeródromo). Paridade com a leitura do web: `kind`/`mapFileType` em ' +
        'lowercase e `geoJson` como objeto.',
    }),
    ApiParam({
      name: 'id',
      format: 'uuid',
      description: 'Identificador do aeródromo (aerodromeId)',
    }),
    ApiOkResponse({ type: GeojsonForAerodromeResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `aerodrome:read`.' }),
    ApiNotFoundResponse({
      description:
        'GeoJSON inexistente/soft-deletado, ou aeródromo fora do escopo.',
    }),
    ApiUnprocessableEntityResponse({
      description: 'GeoJSON existe mas não está pronto (`status ≠ READY`).',
    }),
    ApiBadGatewayResponse({
      description: 'GeoJSON marcado READY mas com conteúdo ausente/inválido.',
    }),
  );
}
