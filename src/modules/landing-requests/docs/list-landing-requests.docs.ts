import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';

import { PaginationMetadataUtil } from '@/common/utils/pagination.util';

import { LandingRequestsPaginatedResponseDTO } from '../dtos/landing-requests-paginated-response.dto';
import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';

export function ListLandingRequestsDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiExtraModels(
      PaginationMetadataUtil,
      LandingRequestResponseDTO,
      LandingRequestsPaginatedResponseDTO,
    ),
    ApiOperation({ summary: 'Lista paginada de Landing Requests' }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiOkResponse({ type: LandingRequestsPaginatedResponseDTO }),
  );
}
