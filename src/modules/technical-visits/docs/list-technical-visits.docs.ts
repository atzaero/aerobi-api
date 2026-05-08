import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';

import { PaginationMetadataUtil } from '@/common/utils/pagination.util';

import { TechnicalVisitsPaginatedResponseDTO } from '../dtos/technical-visits-paginated-response.dto';
import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';

export function ListTechnicalVisitsDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiExtraModels(
      PaginationMetadataUtil,
      TechnicalVisitResponseDTO,
      TechnicalVisitsPaginatedResponseDTO,
    ),
    ApiOperation({ summary: 'Lista paginada de Technical Visits' }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({
      name: 'operationalAerodromeId',
      required: false,
      format: 'uuid',
    }),
    ApiOkResponse({ type: TechnicalVisitsPaginatedResponseDTO }),
  );
}
