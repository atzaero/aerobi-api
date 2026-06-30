import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';

export function CreateAerodromeDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Cria um(a) Aerodrome' }),
    ApiCreatedResponse({ type: AerodromeResponseDTO }),
  );
}
