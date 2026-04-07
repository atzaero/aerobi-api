import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';

import { NotamResponseDto } from '../dtos/notam-response.dto';

/**
 * Swagger docs para GET /aisweb/notam
 * Proxy AISWEB (DECEA) — NOTice to AirMen.
 */
export function AiswebNotamDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'AISWEB: NOTAMs de aeródromos e espaço aéreo',
      description:
        'Proxy para a API AISWEB/DECEA — retorna NOTices to AirMen. ' +
        'As credenciais `AISWEB_API_KEY` e `AISWEB_API_PASS` são gerenciadas pelo servidor. ' +
        '**Autenticação:** `X-API-Key` = `AEROBI_API_KEY` (ver `AerobiApiKeyGuard`). ' +
        'Fallback automático entre `aisweb.decea.mil.br` e `aisweb.decea.gov.br`.',
    }),
    ApiQuery({
      name: 'icaocode',
      required: false,
      example: 'SBGR',
      description:
        'Código ICAO do aeródromo (convertido para maiúsculas automaticamente).',
    }),
    ApiQuery({
      name: 'dist',
      required: false,
      enum: ['N', 'I'],
      description: 'Distribuição: N = nacional, I = internacional.',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: ['N', 'C', 'R'],
      description: 'Status: N = novo/ativo, C = cancelado, R = substituído.',
    }),
    ApiQuery({
      name: 'type',
      required: false,
      enum: ['N', 'R', 'C'],
      description: 'Tipo: N = NOTAM, R = SNOWTAM, C = BIRDTAM.',
    }),
    ApiQuery({
      name: 'fir',
      required: false,
      example: 'SBBS',
      description: 'Código ICAO da FIR (Flight Information Region).',
    }),
    ApiQuery({
      name: 'nnotam',
      required: false,
      description: 'Número do NOTAM.',
    }),
    ApiQuery({
      name: 'ano',
      required: false,
      example: '2026',
      description: 'Ano do NOTAM.',
    }),
    ApiQuery({
      name: 'dt_start',
      required: false,
      example: '2026-04-01',
      description: 'Data inicial do intervalo de busca (YYYY-MM-DD).',
    }),
    ApiQuery({
      name: 'dt_end',
      required: false,
      example: '2026-04-30',
      description: 'Data final do intervalo de busca (YYYY-MM-DD).',
    }),
    ApiQuery({
      name: 'serie',
      required: false,
      description: 'Série do NOTAM.',
    }),
    ApiQuery({
      name: 'categoria',
      required: false,
      description: 'Categoria do NOTAM.',
    }),
    ApiQuery({
      name: 'nof',
      required: false,
      description: 'NOF de origem.',
    }),
    ApiQuery({
      name: 'minutes',
      required: false,
      description: 'NOTAMs válidos nos próximos N minutos.',
    }),
    ApiOkResponse({
      description: 'Lista de NOTAMs retornados pela AISWEB.',
      type: NotamResponseDto,
    }),
  );
}
