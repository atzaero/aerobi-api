import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';

export function UpdateAerodromeFeedbackDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Atualiza um(a) AerodromeFeedback por id' }),
    ApiParam({ name: 'aerodromeFeedbackId', description: 'Identificador' }),
    ApiOkResponse({ type: AerodromeFeedbackResponseDTO }),
  );
}
