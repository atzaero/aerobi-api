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

export function FindCameraByIdDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Busca uma câmera por id',
      description: 'Requer `camera:read` + escopo de grupo.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiOkResponse({ type: CameraResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `camera:read`.' }),
    ApiNotFoundResponse({
      description: 'Câmera inexistente ou fora do grupo.',
    }),
  );
}
