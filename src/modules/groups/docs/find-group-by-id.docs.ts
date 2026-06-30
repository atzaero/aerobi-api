import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { GroupResponseDTO } from '../dtos/group-response.dto';

export function FindGroupByIdDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Busca um grupo de aeródromos por ID',
      description:
        'Requer `group:read`. COORDINATOR só acessa o próprio grupo (escopo).',
    }),
    ApiParam({ name: 'id', format: 'uuid', description: 'Identificador' }),
    ApiOkResponse({ type: GroupResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `group:read`.' }),
    ApiNotFoundResponse({
      description: 'Grupo inexistente ou fora do escopo do coordinator.',
    }),
  );
}
