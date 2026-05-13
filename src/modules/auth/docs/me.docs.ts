import { applyDecorators, Get, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { MeResponseDto } from '../dtos/me-response.dto';

export function MeDocs() {
  return applyDecorators(
    Get('me'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Dados do usuário autenticado (a partir do JWT)',
      description:
        'Retorna apenas claims do JWT — sem round-trip ao DB. Para dados ' +
        'completos do usuário, usar `GET /users/:id` (módulo users).',
    }),
    ApiResponse({ status: HttpStatus.OK, type: MeResponseDto }),
    ApiUnauthorizedResponse(),
  );
}
