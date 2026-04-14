import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { plugfieldDeviceListResponseExample } from './plugfield-response.examples';

export function PlugfieldDeviceListDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy Plugfield: listar estações',
      description:
        'Encaminha `GET /device` para a Plugfield. A Aerobi envia `Authorization` a partir de `PLUGFIELD_TOKEN` no servidor. ' +
        '**Autenticação Aerobi:** `X-API-Key` = `AEROBI_API_KEY` (ver `AerobiApiKeyGuard`).\n\n' +
        '**Exemplo curl:**\n```\n' +
        "curl -X GET 'http://localhost:3333/plugfield/device?page=1' \\\n" +
        "  -H 'X-API-Key: <AEROBI_API_KEY>'\n" +
        '```',
    }),
    ApiOkResponse({
      description: 'Lista de estações (formato pode variar).',
      schema: {
        type: 'array',
        items: { type: 'object', additionalProperties: true },
        example: plugfieldDeviceListResponseExample,
      },
    }),
  );
}
