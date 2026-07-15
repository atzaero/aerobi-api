import { applyDecorators, HttpCode, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { PasswordResetResponseDto } from '../dtos/password-reset-response.dto';

export function AdminResetPasswordDocs() {
  return applyDecorators(
    Post(':id/password-reset'),
    HttpCode(200),
    ApiBearerAuth(),
    ApiOperation({
      summary:
        'Dispara um link de redefinição de senha para um usuário (ADMIN)',
      description:
        'Envia um link de redefinição ao email do usuário (reusa o fluxo de token). Não gera nem trafega senha em claro.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiOkResponse({ type: PasswordResetResponseDto }),
    ApiForbiddenResponse(),
    ApiNotFoundResponse(),
  );
}
