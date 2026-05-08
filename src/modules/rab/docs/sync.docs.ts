import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';

import { SyncRabResponseDto } from '../dtos/sync-rab-response.dto';

/**
 * Swagger para `POST /rab/sync`.
 *
 * - **development** (sem `AEROBI_REQUIRE_AUTH`): bypass — sem `X-API-Key` (ver `AerobiApiKeyGuard`).
 * - **Produção** ou dev com `AEROBI_REQUIRE_AUTH=true`: header **`X-API-Key`** = `AEROBI_API_KEY`.
 */
export function SyncDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Disparar sincronização RAB',
      description:
        '**`NODE_ENV=development`** sem `AEROBI_REQUIRE_AUTH`: pedido permitido sem `X-API-Key` (bypass). ' +
        '**Caso contrário:** enviar **`X-API-Key`** igual a `AEROBI_API_KEY`.',
    }),
    ApiResponse({
      status: 200,
      description: 'Resultado da sync RAB.',
      type: SyncRabResponseDto,
    }),
    ApiResponse({
      status: 401,
      description:
        'Fora de bypass: `X-API-Key` em falta/incorreto ou `AEROBI_API_KEY` não configurada no servidor',
    }),
  );
}
