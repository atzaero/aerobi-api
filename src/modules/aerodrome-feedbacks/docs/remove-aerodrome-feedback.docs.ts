import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';

export function RemoveAerodromeFeedbackDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Remove (soft delete) um(a) AerodromeFeedback por id',
    }),
    ApiParam({ name: 'id', description: 'Identificador' }),
    ApiOkResponse({ type: AerodromeFeedbackResponseDTO }),
  );
}
