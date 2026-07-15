import { applyDecorators, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { AdminUpdateUserRequestDto } from '../dtos/admin-update-user-request.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

export function UpdateUserDocs() {
  return applyDecorators(
    Patch(':id'),
    ApiBearerAuth(),
    ApiOperation({
      summary:
        'Edição administrativa de usuário (ADMIN/COORDINATOR; escopo de grupo no service)',
      description:
        'Edita name/email/role/phone de outro usuário. COORDINATOR gere apenas operator/technical/coordinator do próprio grupo e nunca promove a ADMIN. Trocar o email revoga as sessões do alvo e notifica ambos os endereços. Auto-edição de perfil: PATCH /users/me.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiBody({ type: AdminUpdateUserRequestDto }),
    ApiOkResponse({ type: UserResponseDto }),
    ApiForbiddenResponse(),
    ApiNotFoundResponse(),
  );
}
