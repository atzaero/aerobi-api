import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';

export function UpdateGeojsonDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Atualiza um(a) Geojson por id' }),
    ApiParam({ name: 'geojsonId', description: 'Identificador' }),
    ApiOkResponse({ type: GeojsonResponseDTO }),
  );
}
