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

export function UpdateDocumentDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Renomeia um documento (só `originalFilename`)',
      description:
        'Requer `document:update`. Apenas o nome do arquivo é editável ' +
        '(trim, 1–255); não troca o arquivo. Escopo por grupo.',
    }),
    ApiParam({ name: 'id', format: 'uuid', description: 'Identificador' }),
    ApiOkResponse({ type: DocumentResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `document:update`.' }),
    ApiNotFoundResponse({
      description: 'Documento inexistente, soft-deletado ou fora do escopo.',
    }),
  );
}
