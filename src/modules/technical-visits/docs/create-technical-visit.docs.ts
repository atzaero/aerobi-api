import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';

export function CreateTechnicalVisitDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Cria um(a) TechnicalVisit' }),
    ApiCreatedResponse({ type: TechnicalVisitResponseDTO }),
  );
}
