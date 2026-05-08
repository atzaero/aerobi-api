import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';

export function CreatePilotLandingDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Cria um(a) PilotLanding' }),
    ApiCreatedResponse({ type: PilotLandingResponseDTO }),
  );
}
