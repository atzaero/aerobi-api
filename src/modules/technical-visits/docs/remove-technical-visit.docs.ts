import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';

export function RemoveTechnicalVisitDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Remove (soft delete) um(a) TechnicalVisit por id',
    }),
    ApiParam({ name: 'technicalVisitId', description: 'Identificador' }),
    ApiOkResponse({ type: TechnicalVisitResponseDTO }),
  );
}
