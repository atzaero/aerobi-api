import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';

export function PlugfieldDeviceByIdDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy Plugfield: estação por id/código',
      description: 'Encaminha `GET /device/{deviceId}` para a Plugfield.',
    }),
  );
}
