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

export function RemoveDocumentDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Remove (soft delete) um documento',
      description:
        'Requer `document:delete` (ADMIN). O objeto no storage é preservado; ' +
        'grava `deletedBy` com o ator real.',
    }),
    ApiParam({ name: 'id', format: 'uuid', description: 'Identificador' }),
    ApiOkResponse({ type: DocumentResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão `document:delete` (ADMIN-only).',
    }),
    ApiNotFoundResponse({
      description: 'Documento inexistente, soft-deletado ou fora do escopo.',
    }),
  );
}
