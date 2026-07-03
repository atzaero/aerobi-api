import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CameraResponseDTO } from '../dtos/camera-response.dto';

export function CreateCameraDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Cria uma câmera',
      description:
        'Requer `camera:create`. O `icao` é derivado do aeródromo (não do ' +
        'cliente). COORDINATOR só cria no próprio grupo; ADMIN em qualquer.',
    }),
    ApiCreatedResponse({ type: CameraResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão `camera:create` ou aeródromo fora do grupo.',
    }),
    ApiNotFoundResponse({ description: 'Aeródromo inexistente.' }),
    ApiConflictResponse({
      description:
        'Já existe câmera ativa com o mesmo stream (icao/node/path).',
    }),
  );
}
