import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';

/**
 * Ver `RabApiKeyGuard`: em produção (ou dev com auth forçada) exige `X-API-Key`.
 */
export function SyncStateDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Estados de sincronização por período',
      description:
        '**Autenticação:** `X-API-Key` = `RAB_SYNC_API_KEY` (exceto bypass em `development`; ver guard).',
    }),
  );
}
