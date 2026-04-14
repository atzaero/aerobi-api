import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { plugfieldDataDailyResponseExample } from './plugfield-response.examples';

export function PlugfieldDataDailyDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy Plugfield: dados diários',
      description:
        '**Autenticação Aerobi:** `X-API-Key` = `AEROBI_API_KEY`. ' +
        'Encaminha `GET /data/daily` para a Plugfield. Exige `device`, `begin` e `end` na query. ' +
        'Formato de data: `dd/MM/yyyy`.\n\n' +
        '**Exemplo curl:**\n```\n' +
        "curl -X GET 'http://localhost:3333/plugfield/data/daily?device=9133&begin=01/04/2026&end=14/04/2026' \\\n" +
        "  -H 'X-API-Key: <AEROBI_API_KEY>'\n" +
        '```',
    }),
    ApiOkResponse({
      description: 'Array de leituras agrupadas por dia.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 888666 },
            deviceId: { type: 'integer', example: 9133 },
            temp: { type: 'number', example: 28.88 },
            tempMax: { type: 'number', example: 28.88 },
            tempMin: { type: 'number', example: 6.88 },
            wind: { type: 'number', example: 8.88 },
            windBurst: { type: 'number', example: 12 },
            rainAccum: { type: 'number', example: 8.66 },
            humidity: { type: 'number', example: 66.88 },
            radiation: { type: 'number', example: 88.66 },
            evapo: { type: 'number', example: 6.88 },
            localDate: { type: 'string', example: '14/04/2026' },
          },
        },
        example: plugfieldDataDailyResponseExample,
      },
    }),
  );
}
