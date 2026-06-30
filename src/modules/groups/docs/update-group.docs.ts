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

export function UpdateGroupDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza um(a) Group por id',
      description:
        'Requer `group:update` (ADMIN). Apenas `name` é editável; ' +
        '`updatedBy` recebe o usuário autenticado.',
    }),
    ApiParam({ name: 'id', format: 'uuid', description: 'Identificador' }),
    ApiOkResponse({ type: GroupResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `group:update`.' }),
    ApiNotFoundResponse({ description: 'Grupo inexistente.' }),
  );
}
