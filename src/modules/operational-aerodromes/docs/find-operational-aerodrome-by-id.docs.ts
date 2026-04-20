import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';

export function FindOperationalAerodromeByIdDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Busca um(a) OperationalAerodrome por id' }),
    ApiParam({ name: 'id', description: 'Identificador' }),
    ApiOkResponse({ type: OperationalAerodromeResponseDTO }),
  );
}
