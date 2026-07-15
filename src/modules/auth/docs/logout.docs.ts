import { applyDecorators, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { LogoutRequestDto } from '../dtos/logout-request.dto';

export function LogoutDocs() {
  return applyDecorators(
    Post('logout'),
    HttpCode(HttpStatus.NO_CONTENT),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Revoga o refresh apresentado',
      description:
        'Idempotente — sempre retorna 204, mesmo se o refresh já estava ' +
        'revogado ou inválido. O access token expira sozinho pelo TTL.',
    }),
    ApiBody({ type: LogoutRequestDto }),
    ApiResponse({ status: HttpStatus.NO_CONTENT }),
  );
}
