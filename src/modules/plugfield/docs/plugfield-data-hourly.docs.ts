import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { plugfieldDataHourlyResponseExample } from './plugfield-response.examples';

export function PlugfieldDataHourlyDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy Plugfield: dados horários',
      description:
        '**Autenticação Aerobi:** `X-API-Key` = `AEROBI_API_KEY`. ' +
        'Encaminha `GET /data/hourly` para a Plugfield. Exige `device`, `begin` e `end` na query. ' +
        'Formato de data: `dd/MM/yyyy HH`.\n\n' +
        '**Exemplo curl:**\n```\n' +
        "curl -X GET 'http://localhost:3333/plugfield/data/hourly?device=9133&begin=01/04/2026%2008&end=14/04/2026%2020' \\\n" +
        "  -H 'X-API-Key: <AEROBI_API_KEY>'\n" +
        '```',
    }),
    ApiOkResponse({
      description: 'Leitura agrupada por hora.',
      schema: {
        type: 'object',
        properties: {
          directionString: { type: 'string', example: 'NE' },
          id: { type: 'integer', example: 888666 },
          deviceId: { type: 'integer', example: 9133 },
          temp: { type: 'number', example: 28.88 },
          tempMax: { type: 'number', example: 28.88 },
          tempMin: { type: 'number', example: 6.88 },
          deltat: { type: 'number', example: 8.6 },
          wind: { type: 'number', example: 8.6 },
          windBurst: { type: 'number', example: 12 },
          direction: { type: 'number', example: 8.66 },
          rain: { type: 'number', example: 6.88 },
          humidity: { type: 'number', example: 8.66 },
          radiation: { type: 'number', example: 66.88 },
          pressure: { type: 'number', example: 88.66 },
          uv: { type: 'number', example: 66.88 },
          latitude: { type: 'string', example: '-4.96685' },
          longitude: { type: 'string', example: '-42.78744' },
          deviceName: { type: 'string', example: '1677 - CANAÃ' },
          dewPoint: { type: 'number', example: 88.66 },
          localDateTime: {
            type: 'string',
            example: '2026-04-14T20:00:00.000Z',
          },
        },
        example: plugfieldDataHourlyResponseExample,
      },
    }),
  );
}
