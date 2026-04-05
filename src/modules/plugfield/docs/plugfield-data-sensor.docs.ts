import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import {
  plugfieldDataGroupedResponseExample,
  plugfieldDataSeriesResponseExample,
} from './plugfield-response.examples';

export function PlugfieldDataSensorDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy Plugfield: leituras de sensor',
      description:
        'Encaminha `GET /data/sensor` para a Plugfield. Exige `sensorId` ou `deviceId` na query.',
    }),
    ApiOkResponse({
      description:
        'Leituras de sensor (objeto ou array). Exemplos ilustrativos.',
      content: {
        'application/json': {
          schema: {
            oneOf: [
              { type: 'object', additionalProperties: true },
              {
                type: 'array',
                items: { type: 'object', additionalProperties: true },
              },
            ],
          },
          examples: {
            readingsArray: {
              summary: 'Array de leituras (típico)',
              value: plugfieldDataSeriesResponseExample,
            },
            groupedByTimestampMs: {
              summary: 'Objeto agrupado por timestamp (ms)',
              value: plugfieldDataGroupedResponseExample,
            },
          },
        },
      },
    }),
  );
}
