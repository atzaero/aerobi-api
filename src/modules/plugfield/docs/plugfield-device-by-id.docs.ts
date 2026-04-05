import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { plugfieldDeviceByIdResponseExample } from './plugfield-response.examples';

export function PlugfieldDeviceByIdDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy Plugfield: estação por id/código',
      description:
        'Encaminha `GET /device/{deviceId}` para a Plugfield. Exemplo ilustrativo.',
    }),
    ApiOkResponse({
      description: 'Detalhe da estação (formato pode variar).',
      schema: {
        type: 'object',
        additionalProperties: true,
        example: plugfieldDeviceByIdResponseExample,
      },
    }),
  );
}
