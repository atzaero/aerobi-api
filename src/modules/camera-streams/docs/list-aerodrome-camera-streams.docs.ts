import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';

import { CameraStreamResponseDTO } from '../dtos/camera-stream-response.dto';

/** Swagger de `GET /aerodromes/:icao/camera-streams` (pública). */
export function ListAerodromeCameraStreamsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista as câmeras ativas de um aeródromo (lê o Postgres).',
      description:
        'Retorna apenas câmeras ativas e ligadas (enabled=true), lidas do ' +
        'módulo cameras (Postgres). Cada item traz a streamUrl (path relativo ' +
        'da playlist HLS no próprio aerobi-api).',
    }),
    ApiParam({
      name: 'icao',
      example: 'SBSP',
      description: 'ICAO (4 caracteres alfanuméricos).',
    }),
    ApiOkResponse({ type: CameraStreamResponseDTO, isArray: true }),
  );
}
