import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { TECHNICAL_VISIT_RESPONSE_EXAMPLE } from './technical-visit.examples';

export function FindTechnicalVisitByIdDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Busca visita técnica por id' }),
    ApiOkResponse({
      type: TechnicalVisitResponseDTO,
      schema: { example: TECHNICAL_VISIT_RESPONSE_EXAMPLE },
    }),
  );
}
