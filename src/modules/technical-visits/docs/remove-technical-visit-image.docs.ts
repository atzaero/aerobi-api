import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { TechnicalVisitImageResponseDTO } from '../dtos/technical-visit-image-response.dto';
import { TECHNICAL_VISIT_IMAGE_RESPONSE_EXAMPLE } from './technical-visit.examples';

export function RemoveTechnicalVisitImageDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Remove (soft delete) imagem da visita técnica' }),
    ApiOkResponse({
      type: TechnicalVisitImageResponseDTO,
      schema: { example: TECHNICAL_VISIT_IMAGE_RESPONSE_EXAMPLE },
    }),
  );
}
