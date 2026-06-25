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

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';

export function UpdateAerodromeGroupDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza um(a) AerodromeGroup por id',
      description:
        'Requer `group:update` (ADMIN). Apenas `groupName` é editável; ' +
        '`updatedBy` recebe o usuário autenticado.',
    }),
    ApiParam({ name: 'id', format: 'uuid', description: 'Identificador' }),
    ApiOkResponse({ type: AerodromeGroupResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `group:update`.' }),
    ApiNotFoundResponse({ description: 'Grupo inexistente.' }),
  );
}
