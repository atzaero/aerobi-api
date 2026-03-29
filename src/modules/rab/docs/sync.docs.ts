import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';

/**
 * Swagger para `POST /rab/sync`.
 *
 * - **development** (sem `RAB_SYNC_REQUIRE_AUTH`): bypass — sem `X-API-Key` (ver `RabApiKeyGuard`).
 * - **Produção** ou dev com `RAB_SYNC_REQUIRE_AUTH=true`: header **`X-API-Key`** = `RAB_SYNC_API_KEY`.
 */
export function SyncDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Disparar sincronização RAB',
      description:
        '**`NODE_ENV=development`** sem `RAB_SYNC_REQUIRE_AUTH`: pedido permitido sem `X-API-Key` (bypass). ' +
        '**Caso contrário:** enviar **`X-API-Key`** igual a `RAB_SYNC_API_KEY`.',
    }),
    ApiResponse({ status: 200, description: 'Resultado da sync' }),
    ApiResponse({
      status: 401,
      description:
        'Fora de bypass: `X-API-Key` em falta/incorreto ou `RAB_SYNC_API_KEY` não configurada no servidor',
    }),
  );
}
