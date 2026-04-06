import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';

/**
 * Ver `AerobiApiKeyGuard`: em produção (ou dev com auth forçada) exige `X-API-Key`.
 */
export function PublicAerodromesLatestPeriodDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Versão mais recente do dataset de aeródromos públicos',
      description:
        '**Autenticação:** `X-API-Key` = `AEROBI_API_KEY` (exceto bypass em `development`; ver guard). ' +
        'Retorna o `datasetVersion` (data "Atualizado em: YYYY-MM-DD" extraída do CSV) do último sync bem-sucedido, ou `null` se ainda não houve sync.',
    }),
  );
}
