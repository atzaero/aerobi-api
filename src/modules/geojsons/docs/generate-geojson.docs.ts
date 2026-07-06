import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';

export function GenerateGeojsonDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '(Re)gera o GeoJSON de um aeródromo a partir de um KML/KMZ',
      description:
        'Requer `aerodrome:update`. `multipart/form-data` com o arquivo no ' +
        'campo `file` (.kml/.kmz, ≤ 20 MB). Best-effort: converte, deriva ' +
        '`status` READY/ERROR (acima de 900 KiB inline → ERROR) e faz upsert 1:1 ' +
        'por aeródromo (re-ativa registro soft-deletado). Devolve o registro ' +
        'resultante. O `:id` é o **aerodromeId**.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiParam({
      name: 'id',
      format: 'uuid',
      description: 'Identificador do aeródromo (aerodromeId)',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['file'],
        properties: {
          file: { type: 'string', format: 'binary' },
        },
      },
    }),
    ApiOkResponse({ type: GeojsonResponseDTO }),
    ApiBadRequestResponse({
      description: 'Arquivo ausente/vazio ou formato inválido (use .kml/.kmz).',
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description:
        'Sem permissão `aerodrome:update` ou aeródromo fora do escopo.',
    }),
    ApiNotFoundResponse({ description: 'Aeródromo inexistente.' }),
  );
}
