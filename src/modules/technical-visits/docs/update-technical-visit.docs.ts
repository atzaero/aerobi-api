import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { UpdateTechnicalVisitDTO } from '../dtos/update-technical-visit.dto';
import {
  TECHNICAL_VISIT_RESPONSE_EXAMPLE,
  TECHNICAL_VISIT_UPDATE_EXAMPLE,
} from './technical-visit.examples';

export function UpdateTechnicalVisitDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Atualiza uma visita técnica' }),
    ApiBody({
      type: UpdateTechnicalVisitDTO,
      examples: {
        parcial: {
          summary: 'Atualização parcial do formulário',
          value: TECHNICAL_VISIT_UPDATE_EXAMPLE,
        },
      },
    }),
    ApiOkResponse({
      type: TechnicalVisitResponseDTO,
      schema: { example: TECHNICAL_VISIT_RESPONSE_EXAMPLE },
    }),
  );
}
