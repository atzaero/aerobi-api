import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ExportMovementsDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Exporta movimentos em CSV',
      description:
        'Mesmos filtros e escopo da listagem, sem paginação. Inclui as colunas ' +
        'ricas (status, comentários, criado em) ausentes na lista enxuta. ' +
        'Formato RFC 4180 + BOM UTF-8. Limite de 50.000 linhas.',
    }),
    ApiProduces('text/csv'),
    ApiOkResponse({
      description: 'Arquivo CSV (`text/csv; charset=utf-8`).',
      schema: { type: 'string', format: 'binary' },
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `movement:export`.' }),
  );
}
