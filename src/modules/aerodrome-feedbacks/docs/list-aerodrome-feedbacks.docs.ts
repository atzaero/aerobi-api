import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';

import { PaginationMetadataUtil } from '@/common/utils/pagination.util';

import { AerodromeFeedbacksPaginatedResponseDTO } from '../dtos/aerodrome-feedbacks-paginated-response.dto';
import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';

export function ListAerodromeFeedbacksDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiExtraModels(
      PaginationMetadataUtil,
      AerodromeFeedbackResponseDTO,
      AerodromeFeedbacksPaginatedResponseDTO,
    ),
    ApiOperation({ summary: 'Lista paginada de Aerodrome Feedbacks' }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiOkResponse({ type: AerodromeFeedbacksPaginatedResponseDTO }),
  );
}
