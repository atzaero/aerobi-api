import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { DocumentResponseDTO } from '../dtos/document-response.dto';
import { DOCUMENT_TYPE_API_VALUES } from '../utils/document-type';

export function CreateDocumentDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Envia um documento de aeródromo',
      description:
        'Requer `document:create`. `multipart/form-data` com `file` (≤10 MB, ' +
        'qualquer mimetype), `aerodromeId` e `type`. Múltiplos documentos do ' +
        'mesmo tipo coexistem (não sobrescreve). Escopo pelo aeródromo de destino.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['file', 'aerodromeId', 'type'],
        properties: {
          file: { type: 'string', format: 'binary' },
          aerodromeId: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: [...DOCUMENT_TYPE_API_VALUES] },
        },
      },
    }),
    ApiCreatedResponse({ type: DocumentResponseDTO }),
    ApiBadRequestResponse({
      description: 'Arquivo ausente/vazio, acima de 10 MB ou payload inválido.',
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `document:create`.' }),
    ApiNotFoundResponse({
      description: 'Aeródromo inexistente ou fora do escopo.',
    }),
  );
}
