import { applyDecorators, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { VerifyPasswordResetTokenDto } from '../dtos/verify-password-reset-token.dto';

export function VerifyPasswordResetTokenDocs() {
  return applyDecorators(
    Post('password-reset/verify-token'),
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: 'Valida token de reset sem consumir (UX da página)',
    }),
    ApiBody({ type: VerifyPasswordResetTokenDto }),
    ApiOkResponse({
      schema: { properties: { valid: { type: 'boolean' } } },
    }),
    ApiBadRequestResponse({ description: 'Token inválido / expirado.' }),
  );
}
