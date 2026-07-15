import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { TechnicalVisitImageResponseDTO } from '../dtos/technical-visit-image-response.dto';
import { TECHNICAL_VISIT_IMAGE_RESPONSE_EXAMPLE } from './technical-visit.examples';

export function ListTechnicalVisitImagesDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Lista imagens ativas da visita técnica' }),
    ApiOkResponse({
      type: TechnicalVisitImageResponseDTO,
      isArray: true,
      schema: { example: [TECHNICAL_VISIT_IMAGE_RESPONSE_EXAMPLE] },
    }),
  );
}
