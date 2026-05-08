import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';

import { SyncPrivateAerodromesResponseDto } from '../dtos/sync-private-aerodromes-response.dto';

export function SyncDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Disparar sincronização de Aeródromos Privados',
      description:
        '**`NODE_ENV=development`** sem `AEROBI_REQUIRE_AUTH`: pedido permitido sem `X-API-Key`. ' +
        '**Caso contrário:** enviar **`X-API-Key`** igual a `AEROBI_API_KEY`.',
    }),
    ApiResponse({
      status: 200,
      description:
        'Estado/execução da sincronização (skip por HEAD/hash ou import).',
      type: SyncPrivateAerodromesResponseDto,
    }),
    ApiResponse({
      status: 401,
      description:
        'Fora de bypass: `X-API-Key` em falta/incorreto ou `AEROBI_API_KEY` não configurada no servidor',
    }),
  );
}
