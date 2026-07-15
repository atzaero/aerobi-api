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
import { FeedbackRating } from '@/generated/prisma/client';

import { FeedbacksPaginatedResponseDTO } from '../dtos/feedbacks-paginated-response.dto';
import { FeedbackResponseDTO } from '../dtos/feedback-response.dto';

export function ListFeedbacksDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiExtraModels(
      PaginationMetadataUtil,
      FeedbackResponseDTO,
      FeedbacksPaginatedResponseDTO,
    ),
    ApiOperation({
      summary: 'Lista paginada de feedbacks (moderação)',
      description:
        'Requer `feedback:list`. Escopo por grupo: ADMIN vê todos; COORDINATOR ' +
        'só os de aeródromos do próprio grupo. Ordena por `createdAt` DESC.',
    }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({ name: 'aerodromeId', required: false, format: 'uuid' }),
    ApiQuery({ name: 'rating', required: false, enum: FeedbackRating }),
    ApiQuery({
      name: 'startDate',
      required: false,
      description:
        'Início do intervalo de feedbackDate (YYYY-MM-DD, inclusivo)',
      example: '2026-01-01',
    }),
    ApiQuery({
      name: 'endDate',
      required: false,
      description: 'Fim do intervalo de feedbackDate (YYYY-MM-DD, inclusivo)',
      example: '2026-12-31',
    }),
    ApiOkResponse({ type: FeedbacksPaginatedResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `feedback:list`.' }),
  );
}
