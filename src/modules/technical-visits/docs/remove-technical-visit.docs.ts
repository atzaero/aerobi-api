import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { TECHNICAL_VISIT_RESPONSE_EXAMPLE } from './technical-visit.examples';

export function RemoveTechnicalVisitDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Remove (soft delete) uma visita técnica' }),
    ApiOkResponse({
      type: TechnicalVisitResponseDTO,
      schema: { example: TECHNICAL_VISIT_RESPONSE_EXAMPLE },
    }),
  );
}
