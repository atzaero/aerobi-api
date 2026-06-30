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

import { GroupDeletionResponseDTO } from '../dtos/group-deletion-response.dto';

export function RemoveGroupDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Remove (soft delete) um grupo de aeródromos',
      description:
        'Requer `group:delete` (ADMIN). Cascata: fecha os aeródromos do grupo ' +
        '(`isOpen=false`, `isView=false`) na mesma transação e devolve ' +
        '`affectedAerodromes`. `deletedBy` recebe o usuário autenticado.',
    }),
    ApiParam({ name: 'id', format: 'uuid', description: 'Identificador' }),
    ApiOkResponse({ type: GroupDeletionResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `group:delete`.' }),
    ApiNotFoundResponse({ description: 'Grupo inexistente.' }),
  );
}
