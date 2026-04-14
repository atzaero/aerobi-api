import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { plugfieldDeviceByIdResponseExample } from './plugfield-response.examples';

export function PlugfieldDeviceByIdDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy Plugfield: estação por id',
      description:
        '**Autenticação Aerobi:** `X-API-Key` = `AEROBI_API_KEY`. ' +
        'Encaminha `GET /device/{deviceId}` para a Plugfield.\n\n' +
        '**Exemplo curl:**\n```\n' +
        "curl -X GET 'http://localhost:3333/plugfield/device/9133' \\\n" +
        "  -H 'X-API-Key: <AEROBI_API_KEY>'\n" +
        '```',
    }),
    ApiParam({
      name: 'deviceId',
      description: 'Id da estação Plugfield.',
      example: '9133',
      type: 'string',
    }),
    ApiOkResponse({
      description: 'Detalhe da estação com dashboard e lista de sensores.',
      schema: {
        type: 'object',
        additionalProperties: true,
        example: plugfieldDeviceByIdResponseExample,
      },
    }),
  );
}
