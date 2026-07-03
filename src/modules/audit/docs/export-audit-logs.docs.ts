import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
} from '@nestjs/swagger';

export function ExportAuditLogsDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiProduces('text/csv'),
    ApiOperation({
      summary: 'Exporta registros de auditoria em CSV (ADMIN/COORDINATOR)',
      description:
        'Mesmos filtros da listagem, sem paginação. CSV com BOM UTF-8, CRLF e ' +
        'escape RFC 4180; 6 colunas com rótulos pt-BR; teto de ' +
        '`50 000` linhas (sinalizado via `X-Export-Truncated`/`X-Export-Total`). ' +
        'Arquivo `auditoria-YYYY-MM-DD.csv`.',
    }),
    ApiOkResponse({
      description: 'Arquivo CSV.',
      content: { 'text/csv': { schema: { type: 'string' } } },
    }),
    ApiForbiddenResponse(),
  );
}
