import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';

export function FindTechnicalVisitByIdDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Busca um(a) TechnicalVisit por id' }),
    ApiParam({ name: 'id', description: 'Identificador' }),
    ApiOkResponse({ type: TechnicalVisitResponseDTO }),
  );
}
