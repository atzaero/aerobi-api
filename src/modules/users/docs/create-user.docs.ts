import { applyDecorators, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { CreateUserRequestDto } from '../dtos/create-user-request.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

export function CreateUserDocs() {
  return applyDecorators(
    Post(),
    HttpCode(HttpStatus.CREATED),
    ApiBearerAuth(),
    ApiOperation({
      summary:
        'Cria um novo usuário (ADMIN/COORDINATOR) e dispara convite por email',
      description:
        'Cria User com `password=null` e role definida. ' +
        'COORDINATOR só pode criar OPERATOR/TECHNICAL (recorte por role-alvo) e ' +
        'o novo user **herda o grupo/UF do próprio COORDINATOR** (`groupId`/`state` ' +
        'do body são ignorados). ADMIN cria qualquer role: ao criar ' +
        'COORDINATOR/OPERATOR/TECHNICAL deve informar `groupId` + `state`; ' +
        'ao criar ADMIN o grupo/UF ficam nulos (admin global). ' +
        'Em seguida emite Token tipo INVITE e dispara `user.invited` — ' +
        'o convidado recebe email com link `${FRONTEND_URL}/accept-invite?token=...&email=...`.',
    }),
    ApiBody({ type: CreateUserRequestDto }),
    ApiCreatedResponse({ type: UserResponseDto }),
    ApiConflictResponse({ description: 'Email já registrado.' }),
    ApiBadRequestResponse({
      description:
        'ADMIN criando role com grupo sem informar `groupId`/`state`.',
    }),
    ApiForbiddenResponse({
      description:
        'Sem permissão `user:create`, COORDINATOR tentando criar ADMIN/COORDINATOR, ou COORDINATOR sem grupo provisionado.',
    }),
  );
}
