import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';

export function RemovePilotLandingDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Remove (soft delete) um(a) PilotLanding por id' }),
    ApiParam({ name: 'pilotLandingId', description: 'Identificador' }),
    ApiOkResponse({ type: PilotLandingResponseDTO }),
  );
}
