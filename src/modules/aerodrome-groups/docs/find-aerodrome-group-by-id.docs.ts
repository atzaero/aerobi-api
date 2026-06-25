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

export function FindAerodromeGroupByIdDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Busca um(a) AerodromeGroup por id',
      description:
        'Requer `group:read`. COORDINATOR só acessa o próprio grupo (escopo).',
    }),
    ApiParam({ name: 'id', format: 'uuid', description: 'Identificador' }),
    ApiOkResponse({ type: AerodromeGroupResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Grupo fora do escopo do coordinator.',
    }),
    ApiNotFoundResponse({ description: 'Grupo inexistente.' }),
  );
}
