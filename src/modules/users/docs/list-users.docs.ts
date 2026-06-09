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
    ApiOperation({ summary: 'Lista usuários paginados (ADMIN/COORDINATOR)' }),
    ApiOkResponse({ type: UsersPaginatedResponseDto }),
    ApiForbiddenResponse(),
  );
}
