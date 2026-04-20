import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';

export function CreateAerodromeGeojsonDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Cria um(a) AerodromeGeojson' }),
    ApiCreatedResponse({ type: AerodromeGeojsonResponseDTO }),
  );
}
