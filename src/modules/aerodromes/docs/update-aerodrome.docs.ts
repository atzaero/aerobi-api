import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';

export function UpdateAerodromeDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Atualiza um(a) Aerodrome por id' }),
    ApiParam({ name: 'aerodromeId', description: 'Identificador' }),
    ApiOkResponse({ type: AerodromeResponseDTO }),
  );
}
