import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';

export function UpdateOperationalAerodromeDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Atualiza um(a) OperationalAerodrome por id' }),
    ApiParam({ name: 'id', description: 'Identificador' }),
    ApiOkResponse({ type: OperationalAerodromeResponseDTO }),
  );
}
