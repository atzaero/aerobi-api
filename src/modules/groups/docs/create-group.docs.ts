import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { GroupResponseDTO } from '../dtos/group-response.dto';

export function CreateGroupDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Cria um(a) Group',
      description:
        'Requer permissão `group:create` (ADMIN). `createdBy` é o usuário autenticado.',
    }),
    ApiCreatedResponse({ type: GroupResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `group:create`.' }),
  );
}
