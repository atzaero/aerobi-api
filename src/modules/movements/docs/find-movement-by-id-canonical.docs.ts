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

export function FindMovementByIdCanonicalDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Busca um movimento por id.' }),
    ApiOkResponse({ type: MovementResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `movement:read`.' }),
    ApiNotFoundResponse({
      description: 'Movimento não encontrado ou fora do escopo do ator.',
    }),
  );
}
