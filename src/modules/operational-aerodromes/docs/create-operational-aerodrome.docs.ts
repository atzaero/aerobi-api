import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';

export function CreateOperationalAerodromeDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Cria um(a) OperationalAerodrome' }),
    ApiCreatedResponse({ type: OperationalAerodromeResponseDTO }),
  );
}
