import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { DOCUMENT_TYPE_API_VALUES } from '../utils/document-type';

export function ExportDocumentsDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Exporta documentos em CSV',
      description:
        'Requer `document:export`. Mesmo escopo/filtros da listagem; 6 colunas ' +
        '(RFC 4180 + BOM), até 50k linhas (headers `X-Export-*` sinalizam ' +
        'truncamento).',
    }),
    ApiProduces('text/csv'),
    ApiQuery({ name: 'aerodromeId', required: false, format: 'uuid' }),
    ApiQuery({ name: 'type', required: false, enum: DOCUMENT_TYPE_API_VALUES }),
    ApiQuery({ name: 'search', required: false }),
    ApiOkResponse({
      description: 'Arquivo CSV.',
      content: { 'text/csv': { schema: { type: 'string' } } },
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `document:export`.' }),
  );
}
