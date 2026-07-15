import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { DocumentResponseDTO } from '../dtos/document-response.dto';

export function FindDocumentByIdDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Busca um documento por id',
      description: 'Requer `document:read`. Escopo por grupo (via aeródromo).',
    }),
    ApiParam({ name: 'id', format: 'uuid', description: 'Identificador' }),
    ApiOkResponse({ type: DocumentResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `document:read`.' }),
    ApiNotFoundResponse({
      description: 'Documento inexistente, soft-deletado ou fora do escopo.',
    }),
  );
}
