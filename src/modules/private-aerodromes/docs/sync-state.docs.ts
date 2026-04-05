import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';

export function SyncStateDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Estados de sincronização de Aeródromos Privados',
      description:
        '**Autenticação:** `X-API-Key` = `AEROBI_API_KEY` (exceto bypass em `development`; ver `AerobiApiKeyGuard`).',
    }),
  );
}
