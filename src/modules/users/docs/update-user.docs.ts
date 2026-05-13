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

import { UpdateUserRequestDto } from '../dtos/update-user-request.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

export function UpdateUserDocs() {
  return applyDecorators(
    Patch(':id'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza um usuário (self ou ADMIN; role só ADMIN)',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiBody({ type: UpdateUserRequestDto }),
    ApiOkResponse({ type: UserResponseDto }),
    ApiForbiddenResponse(),
    ApiNotFoundResponse(),
  );
}
