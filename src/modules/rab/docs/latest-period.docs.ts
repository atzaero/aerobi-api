import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';

/**
 * Ver `RabApiKeyGuard`: em produção (ou dev com auth forçada) exige `X-API-Key`.
 */
export function LatestPeriodDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Último período YYYY-MM listado no índice ANAC (sem gravar)',
      description:
        '**Autenticação:** `X-API-Key` = `RAB_SYNC_API_KEY` (exceto bypass em `development`; ver guard).',
    }),
  );
}
