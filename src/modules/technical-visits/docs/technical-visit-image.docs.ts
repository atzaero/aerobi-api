import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { TechnicalVisitImageResponseDTO } from '../dtos/technical-visit-image-response.dto';
import { TECHNICAL_VISIT_IMAGE_RESPONSE_EXAMPLE } from './technical-visit.examples';

export function AddTechnicalVisitImageDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Adiciona imagem à visita técnica' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['image', 'section'],
        properties: {
          image: { type: 'string', format: 'binary' },
          section: { type: 'string', example: 'fence' },
        },
      },
    }),
    ApiCreatedResponse({
      type: TechnicalVisitImageResponseDTO,
      schema: { example: TECHNICAL_VISIT_IMAGE_RESPONSE_EXAMPLE },
    }),
  );
}

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
