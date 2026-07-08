import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { PaginationMetadataUtil } from '@/common/utils/pagination.util';

import { TechnicalVisitsPaginatedResponseDTO } from '../dtos/technical-visits-paginated-response.dto';
import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import {
  TECHNICAL_VISIT_EXAMPLE_AERODROME_ID,
  TECHNICAL_VISIT_EXAMPLE_ICAO,
  TECHNICAL_VISITS_PAGINATED_EXAMPLE,
} from './technical-visit.examples';

export function ListTechnicalVisitsDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiExtraModels(
      PaginationMetadataUtil,
      TechnicalVisitResponseDTO,
      TechnicalVisitsPaginatedResponseDTO,
    ),
    ApiOperation({ summary: 'Lista paginada de visitas técnicas' }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({
      name: 'aerodromeId',
      required: false,
      format: 'uuid',
      example: TECHNICAL_VISIT_EXAMPLE_AERODROME_ID,
    }),
    ApiQuery({
      name: 'search',
      required: false,
      example: TECHNICAL_VISIT_EXAMPLE_ICAO,
    }),
    ApiOkResponse({
      type: TechnicalVisitsPaginatedResponseDTO,
      schema: { example: TECHNICAL_VISITS_PAGINATED_EXAMPLE },
    }),
  );
}
