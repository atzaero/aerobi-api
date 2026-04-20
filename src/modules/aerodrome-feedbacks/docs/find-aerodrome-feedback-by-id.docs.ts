import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';

export function FindAerodromeFeedbackByIdDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Busca um(a) AerodromeFeedback por id' }),
    ApiParam({ name: 'id', description: 'Identificador' }),
    ApiOkResponse({ type: AerodromeFeedbackResponseDTO }),
  );
}
