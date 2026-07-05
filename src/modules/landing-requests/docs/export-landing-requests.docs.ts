import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ExportLandingRequestsDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Exporta solicitações de pouso em CSV (moderação)',
      description:
        'Requer `landing_request:export`. Mesmo escopo/filtros da listagem. ' +
        'Formato RFC 4180 + BOM UTF-8, 8 colunas do web (**sem CPF**); teto de ' +
        '50.000 linhas (sinalizado via `X-Export-Truncated`).',
    }),
    ApiProduces('text/csv'),
    ApiOkResponse({
      description: 'Arquivo CSV (`text/csv; charset=utf-8`).',
      schema: { type: 'string', format: 'binary' },
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão `landing_request:export`.',
    }),
  );
}
