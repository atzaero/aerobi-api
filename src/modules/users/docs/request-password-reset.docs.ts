import { applyDecorators, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { PasswordResetResponseDto } from '../dtos/password-reset-response.dto';
import { RequestPasswordResetDto } from '../dtos/request-password-reset.dto';

export function RequestPasswordResetDocs() {
  return applyDecorators(
    Post('password-reset/request'),
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: 'Solicita link de redefinição de senha',
      description:
        'Sempre retorna 200 com mensagem genérica — evita user enumeration. ' +
        'Token só é emitido (e email enviado) se o user existe, está ativo ' +
        'e já aceitou o convite.',
    }),
    ApiBody({ type: RequestPasswordResetDto }),
    ApiOkResponse({ type: PasswordResetResponseDto }),
  );
}
