import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { FeedbackRating } from '@/generated/prisma/client';

export function ExportFeedbacksDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Exporta feedbacks em CSV (moderação)',
      description:
        'Requer `feedback:export`. Mesmo escopo/filtros da listagem: ADMIN ' +
        'exporta todos; COORDINATOR só os de aeródromos do próprio grupo. ' +
        'Formato RFC 4180 + BOM UTF-8, com as 4 colunas do web; teto de 50.000 ' +
        'linhas (sinalizado via `X-Export-Truncated`).',
    }),
    ApiProduces('text/csv'),
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
    ApiOkResponse({
      description: 'Arquivo CSV (`text/csv; charset=utf-8`).',
      schema: { type: 'string', format: 'binary' },
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `feedback:export`.' }),
  );
}
