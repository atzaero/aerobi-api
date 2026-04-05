import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { plugfieldDeviceListResponseExample } from './plugfield-response.examples';

export function PlugfieldDeviceListDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy Plugfield: listar estações',
      description:
        'Encaminha `GET /device` para a Plugfield. Opcionalmente repassa header `Authorization` do cliente ou usa `PLUGFIELD_VENDOR_AUTHORIZATION`. ' +
        'Exemplo ilustrativo.',
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
