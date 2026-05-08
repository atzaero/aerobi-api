import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';

export function CreateAerodromeGroupDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Cria um(a) AerodromeGroup' }),
    ApiCreatedResponse({ type: AerodromeGroupResponseDTO }),
  );
}
