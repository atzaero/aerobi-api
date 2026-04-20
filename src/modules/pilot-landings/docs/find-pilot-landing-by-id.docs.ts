import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';

export function FindPilotLandingByIdDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Busca um(a) PilotLanding por id' }),
    ApiParam({ name: 'id', description: 'Identificador' }),
    ApiOkResponse({ type: PilotLandingResponseDTO }),
  );
}
