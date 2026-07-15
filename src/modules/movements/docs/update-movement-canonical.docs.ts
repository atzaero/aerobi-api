import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { MovementResponseDTO } from '../dtos/movement-response.dto';
import { UpdateMovementDTO } from '../dtos/update-movement.dto';

export function UpdateMovementCanonicalDocs() {
  return applyDecorators(
    ApiBearerAuth(),
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
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `movement:update`.' }),
    ApiNotFoundResponse({
      description: 'Movimento não encontrado ou fora do escopo do ator.',
    }),
  );
}
