import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PaginationMetadataUtil } from '@/common/utils/pagination.util';
import { GeojsonStatus } from '@/generated/prisma/client';

import { GeojsonsPaginatedResponseDTO } from '../dtos/geojsons-paginated-response.dto';
import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';

export function ListGeojsonsDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiExtraModels(
      PaginationMetadataUtil,
      GeojsonResponseDTO,
      GeojsonsPaginatedResponseDTO,
    ),
    ApiOperation({
      summary: 'Lista paginada de Geojsons',
      description:
        'Requer `aerodrome:list`. Escopo por grupo do ator ' +
        '(ADMIN vê tudo; COORDINATOR/OPERATOR/TECHNICAL restritos ao seu grupo).',
    }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({
      name: 'aerodromeId',
      required: false,
      format: 'uuid',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: GeojsonStatus,
      description:
        '`READY`, `ERROR` — filtro pelo estado da geração do GeoJSON',
    }),
    ApiOkResponse({ type: GeojsonsPaginatedResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `aerodrome:list`.' }),
  );
}
