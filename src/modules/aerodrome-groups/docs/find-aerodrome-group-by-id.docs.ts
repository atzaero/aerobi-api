import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';

export function FindAerodromeGroupByIdDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Busca um(a) AerodromeGroup por id' }),
    ApiParam({ name: 'id', description: 'Identificador' }),
    ApiOkResponse({ type: AerodromeGroupResponseDTO }),
  );
}
