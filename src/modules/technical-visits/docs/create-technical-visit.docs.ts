import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { CreateTechnicalVisitDTO } from '../dtos/create-technical-visit.dto';
import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import {
  TECHNICAL_VISIT_CREATE_EXAMPLE,
  TECHNICAL_VISIT_CREATE_EXAMPLE_MIN_OPERATIONAL,
  TECHNICAL_VISIT_RESPONSE_EXAMPLE,
} from './technical-visit.examples';

export function CreateTechnicalVisitDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Cria uma visita técnica' }),
    ApiBody({
      type: CreateTechnicalVisitDTO,
      examples: {
        completo: {
          summary: 'Completo (snapshot de pista do aeródromo)',
          description:
            'Mesmos dados de pista de `AERODROME_EXAMPLE_FULL` (Congonhas / SBSP).',
          value: TECHNICAL_VISIT_CREATE_EXAMPLE,
        },
        minimoOperacional: {
          summary: 'Mínimo operacional (pista obrigatória)',
          description:
            'Mesmos dados de pista de `AERODROME_EXAMPLE_MIN_OPERATIONAL`.',
          value: TECHNICAL_VISIT_CREATE_EXAMPLE_MIN_OPERATIONAL,
        },
      },
    }),
    ApiCreatedResponse({
      type: TechnicalVisitResponseDTO,
      schema: { example: TECHNICAL_VISIT_RESPONSE_EXAMPLE },
    }),
  );
}
