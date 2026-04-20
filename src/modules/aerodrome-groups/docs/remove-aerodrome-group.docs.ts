import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';

export function RemoveAerodromeGroupDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Remove (soft delete) um(a) AerodromeGroup por id',
    }),
    ApiParam({ name: 'aerodromeGroupId', description: 'Identificador' }),
    ApiOkResponse({ type: AerodromeGroupResponseDTO }),
  );
}
