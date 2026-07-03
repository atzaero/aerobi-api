import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CameraResponseDTO } from '../dtos/camera-response.dto';

export function RemoveCameraDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Remove (soft delete) uma câmera',
      description:
        'Requer `camera:delete` + escopo de grupo. Soft delete: seta ' +
        '`deletedAt`/`deletedBy` e `enabled=false`.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiOkResponse({ type: CameraResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `camera:delete`.' }),
    ApiNotFoundResponse({
      description: 'Câmera inexistente ou fora do grupo.',
    }),
  );
}
