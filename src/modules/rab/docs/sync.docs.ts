import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';

/**
 * Swagger para `POST /rab/sync`.
 *
 * - **development:** sem headers (guard em bypass; ver `FirebaseOrApiKeyGuard`).
 * - **Outros ambientes / com `RAB_SYNC_REQUIRE_AUTH=true`:** Bearer = Firebase ID token ou `X-API-Key`.
 */
export function SyncDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Disparar sincronização RAB',
      description:
        '**`NODE_ENV=development`:** pedido permitido sem `Authorization` / `X-API-Key` (bypass documentado no guard). ' +
        '**Caso contrário (ex. produção)** ou se `RAB_SYNC_REQUIRE_AUTH=true`: enviar `Authorization: Bearer <Firebase ID token>` ' +
        '(`getIdToken()` no cliente) **ou** `X-API-Key` igual a `RAB_SYNC_API_KEY` quando definida.',
    }),
    ApiResponse({ status: 200, description: 'Resultado da sync' }),
    ApiResponse({
      status: 401,
      description:
        'Fora de bypass: Bearer inválido em falta, Firebase Admin não configurado, ou API key incorreta',
    }),
  );
}
