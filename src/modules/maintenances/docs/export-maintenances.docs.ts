import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ExportMaintenancesDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Exporta intervenções em CSV',
      description:
        'Mesmos filtros e escopo da listagem. Formato RFC 4180 + BOM UTF-8. ' +
        'Limite de 50.000 linhas. Requer `maintenance:export`.',
    }),
    ApiProduces('text/csv'),
    ApiOkResponse({
      description: 'Arquivo CSV (`text/csv; charset=utf-8`).',
      schema: { type: 'string', format: 'binary' },
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão `maintenance:export`.',
    }),
  );
}
