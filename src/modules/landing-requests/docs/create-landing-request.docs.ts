import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';

export function CreateLandingRequestDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Cria um(a) LandingRequest' }),
    ApiCreatedResponse({ type: LandingRequestResponseDTO }),
  );
}
