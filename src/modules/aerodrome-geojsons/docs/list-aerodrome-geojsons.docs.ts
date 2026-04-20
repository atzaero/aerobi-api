import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';

import { PaginationMetadataUtil } from '@/common/utils/pagination.util';

import { AerodromeGeojsonsPaginatedResponseDTO } from '../dtos/aerodrome-geojsons-paginated-response.dto';
import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';

export function ListAerodromeGeojsonsDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiExtraModels(
      PaginationMetadataUtil,
      AerodromeGeojsonResponseDTO,
      AerodromeGeojsonsPaginatedResponseDTO,
    ),
    ApiOperation({ summary: 'Lista paginada de Aerodrome Geojsons' }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiOkResponse({ type: AerodromeGeojsonsPaginatedResponseDTO }),
  );
}
