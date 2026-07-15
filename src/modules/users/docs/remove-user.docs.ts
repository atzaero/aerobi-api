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
      summary:
        'Soft-delete de um usuário (ADMIN/COORDINATOR) e revoga refresh tokens',
      description:
        'COORDINATOR só pode remover OPERATOR/TECHNICAL (recorte por ' +
        'role-alvo); ADMIN remove qualquer role.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiNoContentResponse(),
    ApiForbiddenResponse({
      description:
        'Sem permissão `user:delete`, ou COORDINATOR tentando remover ADMIN/COORDINATOR.',
    }),
    ApiNotFoundResponse(),
  );
}
