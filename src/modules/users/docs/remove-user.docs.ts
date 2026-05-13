import { applyDecorators, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

export function RemoveUserDocs() {
  return applyDecorators(
    Delete(':id'),
    HttpCode(HttpStatus.NO_CONTENT),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Soft-delete de um usuário (ADMIN) e revoga refresh tokens',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiNoContentResponse(),
    ApiForbiddenResponse(),
    ApiNotFoundResponse(),
  );
}
