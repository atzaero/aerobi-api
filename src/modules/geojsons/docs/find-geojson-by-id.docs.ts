import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';

export function FindGeojsonByIdDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Busca um GeoJSON por id',
      description:
        'Requer `aerodrome:read`. Escopo por grupo do GeoJSON (via aeródromo).',
    }),
    ApiParam({ name: 'id', format: 'uuid', description: 'Identificador' }),
    ApiOkResponse({ type: GeojsonResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `aerodrome:read`.' }),
    ApiNotFoundResponse({
      description: 'GeoJSON inexistente, soft-deletado ou fora do escopo.',
    }),
  );
}
