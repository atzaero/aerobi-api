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
        'Retorna claims do JWT (`id`, `email`, `role`) — sem round-trip ao ' +
        'DB — mais `permissions`: a matriz RBAC já resolvida para o role no ' +
        'formato `{ subject: action[] }`, para o front mostrar/ocultar ações ' +
        'sem reimplementar `can()`. As permissões **não** vivem no JWT: são ' +
        'resolvidas neste endpoint. Para dados completos do usuário, usar ' +
        '`GET /users/:id` (módulo users).',
    }),
    ApiResponse({ status: HttpStatus.OK, type: MeResponseDto }),
    ApiUnauthorizedResponse(),
  );
}
