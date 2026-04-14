import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { plugfieldDeviceAssociateResponseExample } from './plugfield-response.examples';

export function PlugfieldDeviceAssociateDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy Plugfield: associar estação',
      description:
        '**Autenticação Aerobi:** `X-API-Key` = `AEROBI_API_KEY`. ' +
        'Encaminha `POST /device` para a Plugfield com `deviceId` ou `code` no corpo.\n\n' +
        '**Exemplo curl:**\n```\n' +
        "curl -X POST 'http://localhost:3333/plugfield/device' \\\n" +
        "  -H 'X-API-Key: <AEROBI_API_KEY>' \\\n" +
        "  -H 'Content-Type: application/json' \\\n" +
        `  -d '{"code": "TRODPIXX"}'\n` +
        '```',
    }),
    ApiOkResponse({
      description: 'Resultado da associação (formato pode variar).',
      schema: {
        type: 'object',
        additionalProperties: true,
        example: plugfieldDeviceAssociateResponseExample,
      },
    }),
  );
}
