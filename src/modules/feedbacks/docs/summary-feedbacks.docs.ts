import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';

import { FeedbackSummaryResponseDTO } from '../dtos/feedback-summary-response.dto';

export function SummaryFeedbacksDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Resumo público de avaliações de um aeródromo',
      description:
        'Público (protegido apenas pela `X-API-Key`). Conta apenas feedbacks ' +
        'ativos e devolve `{ positive, negative, total }`.',
    }),
    ApiQuery({ name: 'aerodromeId', required: true, format: 'uuid' }),
    ApiOkResponse({ type: FeedbackSummaryResponseDTO }),
  );
}
