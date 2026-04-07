import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';

import { InfotempResponseDto } from '../dtos/infotemp-response.dto';

/**
 * Swagger docs para GET /aisweb/infotemp
 * Proxy AISWEB (DECEA) — INFOrmações TEMPorárias de aeródromos.
 */
export function AiswebInfotempDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'AISWEB: informações temporárias de aeródromo (INFOTEMP)',
      description:
        'Proxy para a API AISWEB/DECEA — retorna INFOrmações TEMPorárias vigentes. ' +
        'As credenciais `AISWEB_API_KEY` e `AISWEB_API_PASS` são gerenciadas pelo servidor. ' +
        '**Autenticação:** `X-API-Key` = `AEROBI_API_KEY` (ver `AerobiApiKeyGuard`). ' +
        'Fallback automático entre `aisweb.decea.mil.br` e `aisweb.decea.gov.br`.',
    }),
    ApiQuery({
      name: 'icaoCode',
      required: false,
      example: 'SBGR',
      description:
        'Código ICAO do aeródromo (convertido para maiúsculas automaticamente).',
    }),
    ApiQuery({
      name: 'number',
      required: false,
      example: '905',
      description: 'Número do INFOTEMP.',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: [0, 1, 2, 3, 4],
      description: 'Status do INFOTEMP (0–4). 0 = todos os históricos.',
    }),
    ApiQuery({
      name: 'dist',
      required: false,
      enum: ['N', 'I'],
      description: 'Distribuição: N = nacional, I = internacional.',
    }),
    ApiOkResponse({
      description: 'Lista de INFOTEMPs retornados pela AISWEB.',
      type: InfotempResponseDto,
    }),
  );
}
