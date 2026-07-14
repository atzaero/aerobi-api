import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ExportMovementsDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Exporta movimentos em CSV',
      description:
        'Mesmos filtros da listagem, sem paginação. Inclui as colunas ricas ' +
        '(status, comentários, criado em) ausentes na lista enxuta. Formato ' +
        'RFC 4180 + BOM UTF-8. Limite de 50.000 linhas.',
    }),
    ApiProduces('text/csv'),
    ApiOkResponse({
      description: 'Arquivo CSV (`text/csv; charset=utf-8`).',
      schema: { type: 'string', format: 'binary' },
    }),
    ApiUnauthorizedResponse({ description: 'X-API-Key ausente ou inválida.' }),
  );
}
