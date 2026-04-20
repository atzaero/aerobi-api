import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';

export function CreateAerodromeFeedbackDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Cria um(a) AerodromeFeedback' }),
    ApiCreatedResponse({ type: AerodromeFeedbackResponseDTO }),
  );
}
