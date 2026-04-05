import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';

export function PlugfieldDeviceListDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy Plugfield: listar estações',
      description:
        'Encaminha `GET /device` para a Plugfield. Opcionalmente repassa header `Authorization` do cliente ou usa `PLUGFIELD_VENDOR_AUTHORIZATION`.',
    }),
  );
}

export function PlugfieldDeviceAssociateDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy Plugfield: associar estação',
      description:
        'Encaminha `POST /device` para a Plugfield com `deviceId` ou `code` no corpo.',
    }),
  );
}
