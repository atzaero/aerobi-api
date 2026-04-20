import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';

export function FindAerodromeGeojsonByIdDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Busca um(a) AerodromeGeojson por id' }),
    ApiParam({ name: 'aerodromeGeojsonId', description: 'Identificador' }),
    ApiOkResponse({ type: AerodromeGeojsonResponseDTO }),
  );
}
