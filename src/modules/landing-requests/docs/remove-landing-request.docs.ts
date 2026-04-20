import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';

export function RemoveLandingRequestDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Remove (soft delete) um(a) LandingRequest por id',
    }),
    ApiParam({ name: 'id', description: 'Identificador' }),
    ApiOkResponse({ type: LandingRequestResponseDTO }),
  );
}
