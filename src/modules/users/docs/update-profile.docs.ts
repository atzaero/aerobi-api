import { applyDecorators, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UpdateProfileRequestDto } from '../dtos/update-profile-request.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

export function UpdateProfileDocs() {
  return applyDecorators(
    Patch('me'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza o próprio perfil (name/phone/timezone)',
      description:
        'Auto-edição do usuário autenticado. Não altera email/role (administrativo) nem senha (POST /users/me/change-password).',
    }),
    ApiBody({ type: UpdateProfileRequestDto }),
    ApiOkResponse({ type: UserResponseDto }),
    ApiUnauthorizedResponse(),
  );
}
