import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';

export function RemoveAerodromeDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Remove (soft delete) um(a) Aerodrome por id',
    }),
    ApiParam({ name: 'aerodromeId', description: 'Identificador' }),
    ApiOkResponse({ type: AerodromeResponseDTO }),
  );
}
