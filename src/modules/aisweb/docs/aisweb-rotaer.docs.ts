import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';

/**
 * Swagger docs para GET /aisweb/rotaer
 * Proxy AISWEB (DECEA) — dados detalhados do aeródromo (ROTAER).
 */
export function AiswebRotaerDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'AISWEB: dados detalhados do aeródromo (ROTAER)',
      description:
        'Proxy para a API AISWEB/DECEA — retorna dados completos do aeródromo: ' +
        'identificação, localização, coordenadas, operador, horário de funcionamento, ' +
        'classificação, pistas, luzes, serviços (COM, NAV, MET, AIS), observações e complementos. ' +
        'As credenciais `AISWEB_API_KEY` e `AISWEB_API_PASS` são gerenciadas pelo servidor. ' +
        '**Autenticação:** `X-API-Key` = `AEROBI_API_KEY` (ver `AerobiApiKeyGuard`). ' +
        'Fallback automático entre `aisweb.decea.mil.br` e `aisweb.decea.gov.br`.',
    }),
    ApiQuery({
      name: 'icaoCode',
      required: true,
      example: 'SBGR',
      description:
        'Código ICAO do aeródromo (convertido para maiúsculas automaticamente).',
    }),
    ApiOkResponse({
      description: 'Dados detalhados do aeródromo conforme ROTAER.',
      schema: {
        type: 'object',
        additionalProperties: true,
        example: {
          meta: { status: 'Active', dt: '2026-01-22' },
          identification: {
            icao: 'SBGR',
            ciad: 'SP0002',
            name: 'Guarulhos - Governador André Franco Montoro',
          },
          locality: { city: 'São Paulo', uf: 'SP' },
          coordinates: {
            latitude: '-23.435555555556',
            longitude: '-46.473055555556',
            latitudeRotaer: '23 26 08S',
            longitudeRotaer: '046 28 23W',
            distance: '24/NE',
          },
          operator: { name: 'INFRAERO', type: 'ORG', military: 'CIVIL' },
          classification: {
            aerodromeType: 'AD',
            utilization: 'PUB/MIL',
            operation: 'VFR IFR',
            category: 'INTL',
          },
          timezone: { utcOffset: '-3' },
          elevation: { meters: '750', feet: '2461' },
          airspace: { fir: 'SBBS', jurisdiction: 'CRCEA-SE' },
          runways: { count: 2, items: [] },
          services: { items: [] },
          remarks: { count: 39, items: [] },
          complements: { count: 9, items: [] },
        },
      },
    }),
  );
}
