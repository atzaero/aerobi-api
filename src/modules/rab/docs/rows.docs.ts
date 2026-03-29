import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiSecurity } from '@nestjs/swagger';

/**
 * Ver `RabApiKeyGuard`: em produção (ou dev com auth forçada) exige `X-API-Key`.
 */
export function RowsDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary:
        'Consulta paginada de linhas RAB por período (dados abertos ANAC)',
      description:
        '**Autenticação:** `X-API-Key` = `RAB_SYNC_API_KEY` (exceto bypass em `development`; ver guard).',
    }),
    ApiQuery({ name: 'period', required: true, example: '2026-03' }),
    ApiQuery({ name: 'skip', required: false }),
    ApiQuery({ name: 'take', required: false }),
  );
}
