import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { AviascanReadingsPaginatedResponseDto } from '../dtos/aviascan-readings-paginated-response.dto';

export function AviascanReadingsDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Proxy AviaScan: leituras paginadas',
      description:
        'Encaminha `GET /api/readings/paginated` para a AviaScan e devolve o envelope `{ data, meta }`. ' +
        'O `image_path` de cada leitura é completado para URL absoluta com a base URL da AviaScan. ' +
        'Suporta paginação (`page`/`limit`) e filtros (`registration`, `aerodrome`, `start_date`, `end_date`). ' +
        '**Autenticação Aerobi:** `X-API-Key` = `AEROBI_API_KEY` (ver `AerobiApiKeyGuard`).\n\n' +
        '**Exemplo curl:**\n```\n' +
        "curl -X GET 'http://localhost:3333/aviascan/readings/paginated?page=1&limit=10&aerodrome=SSCF' \\\n" +
        "  -H 'X-API-Key: <AEROBI_API_KEY>'\n" +
        '```',
    }),
    ApiOkResponse({
      description: 'Página de leituras AviaScan.',
      type: AviascanReadingsPaginatedResponseDto,
    }),
  );
}
