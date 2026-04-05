import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import {
  plugfieldDataGroupedResponseExample,
  plugfieldDataSeriesResponseExample,
} from './plugfield-response.examples';

export function PlugfieldDataDailyDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy Plugfield: dados diários',
      description:
        '**Autenticação Aerobi:** `X-API-Key` = `AEROBI_API_KEY`. ' +
        'Encaminha `GET /data/daily` para a Plugfield. Exige `sensorId` ou `deviceId` na query; tempos em Unix ms. ' +
        'A resposta pode ser objeto (ex.: agrupado por timestamp) ou array — ver exemplos.',
    }),
    ApiOkResponse({
      description:
        'Dados diários (objeto ou array, conforme Plugfield). Exemplos ilustrativos.',
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
