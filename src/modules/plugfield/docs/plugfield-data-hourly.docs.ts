import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import {
  plugfieldDataGroupedResponseExample,
  plugfieldDataSeriesResponseExample,
} from './plugfield-response.examples';

export function PlugfieldDataHourlyDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy Plugfield: dados horários',
      description:
        '**Autenticação Aerobi:** `X-API-Key` = `AEROBI_API_KEY`. ' +
        'Encaminha `GET /data/hourly` para a Plugfield. Exige `sensorId` ou `deviceId` na query. ' +
        'Resposta pode ser objeto ou array.',
    }),
    ApiOkResponse({
      description: 'Dados horários (objeto ou array). Exemplos ilustrativos.',
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
            groupedByTimestampMs: {
              summary: 'Objeto com chaves timestamp (ms)',
              value: plugfieldDataGroupedResponseExample,
            },
            readingsArray: {
              summary: 'Array de leituras',
              value: plugfieldDataSeriesResponseExample,
            },
          },
        },
      },
    }),
  );
}
