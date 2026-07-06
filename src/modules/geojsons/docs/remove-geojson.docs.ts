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

export function RemoveGeojsonDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Remove (soft delete) um GeoJSON por id',
      description:
        'Requer `aerodrome:delete` (ADMIN). Grava `deletedBy` com o ator real.',
    }),
    ApiParam({ name: 'id', format: 'uuid', description: 'Identificador' }),
    ApiOkResponse({ type: GeojsonResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão `aerodrome:delete` (ADMIN-only).',
    }),
    ApiNotFoundResponse({
      description: 'GeoJSON inexistente, soft-deletado ou fora do escopo.',
    }),
  );
}
