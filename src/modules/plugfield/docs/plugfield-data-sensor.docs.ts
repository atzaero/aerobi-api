import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { plugfieldDataSensorResponseExample } from './plugfield-response.examples';

export function PlugfieldDataSensorDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy Plugfield: leituras de sensor',
      description:
        '**Autenticação Aerobi:** `X-API-Key` = `AEROBI_API_KEY`. ' +
        'Encaminha `GET /data/sensor` para a Plugfield. Exige `sensor` e `device` na query.\n\n' +
        '**Exemplo curl:**\n```\n' +
        "curl -X GET 'http://localhost:3333/plugfield/data/sensor?device=9133&sensor=8' \\\n" +
        "  -H 'X-API-Key: <AEROBI_API_KEY>'\n" +
        '```',
    }),
    ApiOkResponse({
      description: 'Leituras de sensor com valores mín/máx e array de dados.',
      schema: {
        type: 'object',
        properties: {
          valueMinFormatted: { type: 'number', example: 12.8 },
          valueMaxFormatted: { type: 'number', example: 32.8 },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 6666 },
                valueFormatted: { type: 'number', example: 18.5 },
                time: { type: 'integer', example: 1776142415000 },
              },
            },
          },
        },
        example: plugfieldDataSensorResponseExample,
      },
    }),
  );
}
