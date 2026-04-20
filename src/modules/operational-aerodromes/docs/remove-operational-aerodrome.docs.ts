import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';

export function RemoveOperationalAerodromeDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Remove (soft delete) um(a) OperationalAerodrome por id',
    }),
    ApiParam({ name: 'operationalAerodromeId', description: 'Identificador' }),
    ApiOkResponse({ type: OperationalAerodromeResponseDTO }),
  );
}
