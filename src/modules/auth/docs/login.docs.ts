import { applyDecorators, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { LoginRequestDto } from '../dtos/login-request.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';

export function LoginDocs() {
  return applyDecorators(
    Post('login'),
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: 'Login com email e senha',
      description:
        'Emite um par fresco de access + refresh tokens JWT RS256. ' +
        'O refresh é persistido (hash SHA-256); o plain volta uma única vez.',
    }),
    ApiBody({ type: LoginRequestDto }),
    ApiResponse({ status: HttpStatus.OK, type: LoginResponseDto }),
    ApiUnauthorizedResponse({
      description:
        'Credenciais inválidas / conta não ativada / não verificada / removida.',
    }),
  );
}
