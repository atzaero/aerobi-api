import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

import { MovementResponseDTO } from '../dtos/movement-response.dto';
import { UpdateMovementDTO } from '../dtos/update-movement.dto';

export function UpdateMovementCanonicalDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Corrige a matrícula (registration) de um movimento.',
      description:
        'Único campo editável. Aceita a matrícula com/sem hífen ou espaços e ' +
        'persiste na forma canônica (sem separadores, maiúsculas). O snapshot ' +
        'RAB da aeronave é re-resolvido para a matrícula corrigida.',
    }),
    ApiParam({
      name: 'movementId',
      description: 'Identificador do movimento.',
    }),
    ApiBody({ type: UpdateMovementDTO }),
    ApiOkResponse({ type: MovementResponseDTO }),
    ApiNotFoundResponse({ description: 'Movimento não encontrado.' }),
  );
}
