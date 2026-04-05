import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';

export function PlugfieldDataDailyDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy Plugfield: dados diários',
      description:
        'Encaminha `GET /data/daily` para a Plugfield. Exige `sensorId` ou `deviceId` na query; tempos em Unix ms.',
    }),
  );
}

export function PlugfieldDataHourlyDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy Plugfield: dados horários',
      description:
        'Encaminha `GET /data/hourly` para a Plugfield. Exige `sensorId` ou `deviceId` na query.',
    }),
  );
}

export function PlugfieldDataSensorDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy Plugfield: leituras de sensor',
      description:
        'Encaminha `GET /data/sensor` para a Plugfield. Exige `sensorId` ou `deviceId` na query.',
    }),
  );
}
