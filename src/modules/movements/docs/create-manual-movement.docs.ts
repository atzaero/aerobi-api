import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';

import { MovementType } from '@/generated/prisma/enums';

import { CreateMovementResponseDTO } from '../dtos/create-movement-response.dto';

export function CreateManualMovementDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Registra um movimento manualmente (interface humana).',
      description:
        'Criação MANUAL pela interface: o operador informa `operationType` (pouso/decolagem) ' +
        'e o aeródromo. multipart/form-data com imagem opcional no campo `image`. ' +
        'Ainda protegido por X-API-Key; `createdBy` vem do corpo até a auth humana chegar.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: [
          'registration',
          'reading_datetime',
          'aerodrome',
          'operationType',
        ],
        properties: {
          registration: { type: 'string', example: 'PR-ZTT' },
          reading_datetime: {
            type: 'string',
            format: 'date-time',
            example: '2026-06-08T16:52:39Z',
          },
          aerodrome: { type: 'string', example: 'SSCF' },
          operationType: {
            type: 'string',
            enum: Object.values(MovementType),
            example: MovementType.LANDING,
          },
          comments: { type: 'string' },
          createdBy: { type: 'string' },
          image: { type: 'string', format: 'binary' },
        },
      },
    }),
    ApiCreatedResponse({ type: CreateMovementResponseDTO }),
  );
}
