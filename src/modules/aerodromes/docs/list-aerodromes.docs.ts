import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';

import { PaginationMetadataUtil } from '@/common/utils/pagination.util';

import { AerodromesPaginatedResponseDTO } from '../dtos/aerodromes-paginated-response.dto';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';

export function ListAerodromesDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiExtraModels(
      PaginationMetadataUtil,
      AerodromeResponseDTO,
      AerodromesPaginatedResponseDTO,
    ),
    ApiOperation({ summary: 'Lista paginada de Aerodromes' }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({
      name: 'groupId',
      required: false,
      format: 'uuid',
      description: 'Filtra pelo grupo de aeródromos',
    }),
    ApiQuery({
      name: 'icao',
      required: false,
      description: 'Filtra ICAO por substring case insensitive',
      example: 'SD',
    }),
    ApiQuery({
      name: 'isView',
      required: false,
      enum: ['true', 'false'],
      description:
        'Filtra aeródromos com `is_view` true quando `true` (string aceite na query)',
    }),
    ApiOkResponse({ type: AerodromesPaginatedResponseDTO }),
  );
}
