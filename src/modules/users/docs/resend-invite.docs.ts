import { applyDecorators, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { UserResponseDto } from '../dtos/user-response.dto';

export function ResendInviteDocs() {
  return applyDecorators(
    Post(':id/invite/resend'),
    HttpCode(HttpStatus.OK),
    ApiBearerAuth(),
    ApiOperation({
      summary:
        'Reenvia convite para um usuário que ainda não aceitou (ADMIN/COORDINATOR)',
      description:
        'Invalida convites pendentes do usuário e emite um novo Token ' +
        'tipo INVITE, disparando email novamente. COORDINATOR só pode ' +
        'reenviar para OPERATOR/TECHNICAL (recorte por role-alvo). Falha com ' +
        '`INVITE_ALREADY_ACCEPTED` se o convite já foi aceito.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiOkResponse({ type: UserResponseDto }),
    ApiNotFoundResponse({ description: 'Usuário não encontrado.' }),
    ApiConflictResponse({ description: 'Convite já foi aceito.' }),
    ApiForbiddenResponse({
      description:
        'Sem permissão `user:create`, ou COORDINATOR reenviando para ADMIN/COORDINATOR.',
    }),
  );
}
