import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';

/**
 * Ver `PlugfieldApiKeyGuard`: em produção (ou dev com auth forçada) exige `X-API-Key` = `PLUGFIELD_SYNC_API_KEY`.
 */
export function PlugfieldLoginDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy Plugfield: login',
      description:
        'Encaminha `POST /login` para a API Plugfield (`prod-api.plugfield.com.br`). ' +
        'Não envia `Authorization` à Plugfield nesta rota. ' +
        '**Autenticação Aerobi:** `X-API-Key` = `PLUGFIELD_SYNC_API_KEY` (exceto bypass em `development`; ver guard).',
    }),
  );
}
