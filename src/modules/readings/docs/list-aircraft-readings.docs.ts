import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { AircraftReadingsPaginatedResponseDTO } from '../dtos/aircraft-readings-paginated-response.dto';

export function ListAircraftReadingsDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Lista leituras de matrícula (paginado, filtros opcionais).',
    }),
    ApiOkResponse({ type: AircraftReadingsPaginatedResponseDTO }),
  );
}
