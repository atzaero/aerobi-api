import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';

export function SyncDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Disparar sincronização de Aeródromos Privados',
      description:
        '**`NODE_ENV=development`** sem `AEROBI_REQUIRE_AUTH`: pedido permitido sem `X-API-Key`. ' +
        '**Caso contrário:** enviar **`X-API-Key`** igual a `AEROBI_API_KEY`.',
    }),
    ApiResponse({ status: 200, description: 'Resultado da sync' }),
    ApiResponse({
      status: 401,
      description:
        'Fora de bypass: `X-API-Key` em falta/incorreto ou `AEROBI_API_KEY` não configurada no servidor',
    }),
  );
}
