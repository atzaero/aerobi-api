import { applyDecorators, HttpCode, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ChangePasswordRequestDto } from '../dtos/change-password-request.dto';
import { ChangePasswordResponseDto } from '../dtos/change-password-response.dto';

export function ChangePasswordDocs() {
  return applyDecorators(
    Post('me/change-password'),
    HttpCode(200),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Troca a própria senha (verifica a senha atual)',
      description:
        'Exige a senha atual; ao trocar, encerra as demais sessões. Senha atual incorreta retorna 401.',
    }),
    ApiBody({ type: ChangePasswordRequestDto }),
    ApiOkResponse({ type: ChangePasswordResponseDto }),
    ApiUnauthorizedResponse(),
  );
}
