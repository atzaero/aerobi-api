import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';

export function UpdateAerodromeGroupDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Atualiza um(a) AerodromeGroup por id' }),
    ApiParam({ name: 'id', description: 'Identificador' }),
    ApiOkResponse({ type: AerodromeGroupResponseDTO }),
  );
}
