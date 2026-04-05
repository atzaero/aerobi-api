import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { plugfieldLoginResponseExample } from './plugfield-response.examples';

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
        '**Autenticação Aerobi:** `X-API-Key` = `PLUGFIELD_SYNC_API_KEY` (exceto bypass em `development`; ver guard). ' +
        'Exemplo ilustrativo; campos reais conforme documentação Plugfield.',
    }),
    ApiOkResponse({
      description: 'Resposta típica (token de acesso).',
      schema: {
        type: 'object',
        additionalProperties: true,
        example: plugfieldLoginResponseExample,
      },
    }),
  );
}
