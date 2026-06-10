import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';

import { CreateMovementBatchResponseDTO } from '../dtos/create-movement-batch.dto';

export function CreateMovementBatchDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Registra um lote de leituras (com imagens opcionais).',
      description:
        'multipart/form-data: `metadata` é um JSON com o array de itens; ' +
        'os arquivos vão em `images` e são referenciados por `image_index` em cada item.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['metadata'],
        properties: {
          metadata: {
            type: 'string',
            description: 'JSON array de itens (ver BatchMovementItemDTO).',
            example:
              '[{"registration":"PR-ZTT","confidence":"0.98","reading_datetime":"2026-06-08T16:52:39Z","aerodrome":"SSCF","image_index":0}]',
          },
          images: {
            type: 'array',
            items: { type: 'string', format: 'binary' },
          },
        },
      },
    }),
    ApiCreatedResponse({ type: CreateMovementBatchResponseDTO }),
  );
}
