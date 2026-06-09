import { applyDecorators, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { UsersPaginatedResponseDto } from '../dtos/users-paginated-response.dto';

export function ListUsersDocs() {
  return applyDecorators(
    Get(),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Lista usuários paginados (ADMIN/COORDINATOR)',
      description:
        'ADMIN lista todos e pode filtrar por `aerodromeGroupId`. ' +
        'COORDINATOR é restrito ao **próprio grupo** (o filtro é forçado a ' +
        'partir do registro do ator, ignorando o `aerodromeGroupId` da query); ' +
        'COORDINATOR sem grupo provisionado recebe lista vazia.',
    }),
    ApiOkResponse({ type: UsersPaginatedResponseDto }),
    ApiForbiddenResponse(),
  );
}
