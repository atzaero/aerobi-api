import { applyDecorators, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { RefreshRequestDto } from '../dtos/refresh-request.dto';
import { RefreshResponseDto } from '../dtos/refresh-response.dto';

export function RefreshSessionDocs() {
  return applyDecorators(
    Post('refresh'),
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: 'Rotaciona refresh token e emite par novo',
      description:
        'Rotação encadeada com `jti` único. Apresentar um refresh já ' +
        'revogado dispara revogação de toda a família (proteção contra reuso).',
    }),
    ApiBody({ type: RefreshRequestDto }),
    ApiResponse({ status: HttpStatus.OK, type: RefreshResponseDto }),
    ApiUnauthorizedResponse({
      description: 'Refresh inválido / expirado / revogado / reuso detectado.',
    }),
  );
}
