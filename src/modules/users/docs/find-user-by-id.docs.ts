import { applyDecorators, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { UserResponseDto } from '../dtos/user-response.dto';

export function FindUserByIdDocs() {
  return applyDecorators(
    Get(':id'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Detalhes de um usuário (self ou ADMIN)',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiOkResponse({ type: UserResponseDto }),
    ApiForbiddenResponse(),
    ApiNotFoundResponse(),
  );
}

export const ParamId = (): ParameterDecorator => Param('id');
