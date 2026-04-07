import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';

import { SolResponseDto } from '../dtos/sol-response.dto';

/**
 * Swagger docs para GET /aisweb/sol
 * Proxy AISWEB (DECEA) — horários de nascer e pôr do sol.
 */
export function AiswebSolDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'AISWEB: horários de nascer e pôr do sol por aeródromo',
      description:
        'Proxy para a API AISWEB/DECEA — retorna os horários de nascer e pôr do sol (UTC) ' +
        'para o aeródromo informado. Se `dt_i` e `dt_f` forem omitidos, retorna o dia atual. ' +
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
    ApiQuery({
      name: 'dt_i',
      required: false,
      example: '2026-04-06',
      description:
        'Data início (YYYY-MM-DD). Se informado, `dt_f` é obrigatório.',
    }),
    ApiQuery({
      name: 'dt_f',
      required: false,
      example: '2026-04-10',
      description:
        'Data fim (YYYY-MM-DD). Obrigatório quando `dt_i` é informado.',
    }),
    ApiOkResponse({
      description: 'Array de dias com horários de nascer e pôr do sol (UTC).',
      type: SolResponseDto,
    }),
  );
}
