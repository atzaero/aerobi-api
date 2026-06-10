import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';

import { CreateMovementResponseDTO } from '../dtos/create-movement-response.dto';

export function CreateMovementDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Registra uma leitura de matrícula (com imagem opcional).',
      description:
        'Ingestão do pipeline aviascan-cv. multipart/form-data com campos em snake_case e a imagem no campo `image`.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['registration', 'confidence', 'reading_datetime'],
        properties: {
          registration: { type: 'string', example: 'PR-ZTT' },
          confidence: { type: 'string', example: '0.98' },
          reading_datetime: {
            type: 'string',
            format: 'date-time',
            example: '2026-06-08T16:52:39Z',
          },
          aerodrome: { type: 'string', example: 'SSCF' },
          reading_status: { type: 'string' },
          revisor_id: { type: 'string' },
          comments: { type: 'string' },
          image: { type: 'string', format: 'binary' },
        },
      },
    }),
    ApiCreatedResponse({ type: CreateMovementResponseDTO }),
  );
}
