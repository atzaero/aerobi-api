import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { MovementResponseDTO } from '../dtos/movement-response.dto';

export function RemoveMovementCanonicalDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Remove (soft delete) um movimento por id.' }),
    ApiOkResponse({ type: MovementResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `movement:delete`.' }),
    ApiNotFoundResponse({
      description: 'Movimento não encontrado ou fora do escopo do ator.',
    }),
  );
}
