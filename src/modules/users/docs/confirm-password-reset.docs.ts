import { applyDecorators, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ConfirmPasswordResetDto } from '../dtos/confirm-password-reset.dto';
import { PasswordResetResponseDto } from '../dtos/password-reset-response.dto';

export function ConfirmPasswordResetDocs() {
  return applyDecorators(
    Post('password-reset/confirm'),
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: 'Confirma reset de senha + revoga todas as sessões do user',
    }),
    ApiBody({ type: ConfirmPasswordResetDto }),
    ApiOkResponse({ type: PasswordResetResponseDto }),
    ApiBadRequestResponse({
      description: 'Token inválido / expirado / senha fraca.',
    }),
  );
}
