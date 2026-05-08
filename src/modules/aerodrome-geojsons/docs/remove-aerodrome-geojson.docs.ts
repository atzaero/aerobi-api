import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';

export function RemoveAerodromeGeojsonDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Remove (soft delete) um(a) AerodromeGeojson por id',
    }),
    ApiParam({ name: 'aerodromeGeojsonId', description: 'Identificador' }),
    ApiOkResponse({ type: AerodromeGeojsonResponseDTO }),
  );
}
