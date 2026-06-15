import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';

import { CameraResponseDTO } from '../dtos/camera-response.dto';

/** Swagger de `GET /aerodromes/:icao/cameras`. */
export function ListAerodromeCamerasDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Lista as câmeras ativas de um aeródromo (lê o Firestore).',
      description:
        'Retorna apenas câmeras com enabled=true. O cadastro é gerido no ' +
        'frontend (Firestore); o backend só lê. Cada item traz a streamUrl ' +
        '(path relativo da playlist HLS no próprio aerobi-api).',
    }),
    ApiParam({
      name: 'icao',
      example: 'SBSP',
      description: 'ICAO (4 letras).',
    }),
    ApiOkResponse({ type: CameraResponseDTO, isArray: true }),
    ApiResponse({
      status: 401,
      description: 'Fora de bypass: `X-API-Key` em falta ou incorreto.',
    }),
    ApiResponse({
      status: 502,
      description: 'Firestore indisponível ao listar as câmeras.',
    }),
  );
}
