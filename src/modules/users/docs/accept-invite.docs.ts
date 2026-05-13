import { applyDecorators, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { AcceptInviteRequestDto } from '../dtos/accept-invite-request.dto';
import { AcceptInviteResponseDto } from '../dtos/accept-invite-response.dto';

export function AcceptInviteDocs() {
  return applyDecorators(
    Post('invite/accept'),
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: 'Aceita convite + define senha + emite par JWT (logado)',
      description:
        'Endpoint público. Recebe `{email, token, password, name?}`. ' +
        'Valida token INVITE, aplica política de senha, marca convite ' +
        'como aceito (`emailVerified=true`) e devolve o par já logado.',
    }),
    ApiBody({ type: AcceptInviteRequestDto }),
    ApiOkResponse({ type: AcceptInviteResponseDto }),
    ApiBadRequestResponse({
      description: 'Token inválido / expirado / já aceito / senha fraca.',
    }),
  );
}
