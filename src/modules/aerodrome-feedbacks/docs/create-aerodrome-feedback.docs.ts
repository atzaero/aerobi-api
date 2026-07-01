import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';

export function CreateAerodromeFeedbackDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Envia uma avaliação pública de aeródromo',
      description:
        'Público/anônimo (sem login humano; protegido apenas pela `X-API-Key`). ' +
        '`feedbackDate` (dia UTC) e `createdBy` são derivados no servidor. ' +
        'Rate-limit diário por sessão + aeródromo → 409.',
    }),
    ApiCreatedResponse({ type: AerodromeFeedbackResponseDTO }),
    ApiNotFoundResponse({ description: 'Aeródromo inexistente ou removido.' }),
    ApiConflictResponse({
      description: 'Já existe avaliação para esta sessão hoje.',
    }),
  );
}
