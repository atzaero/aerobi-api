import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CameraResponseDTO } from '../dtos/camera-response.dto';

export function UpdateCameraDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza uma câmera (parcial)',
      description:
        'Requer `camera:update` + escopo de grupo. `aerodromeId`/`icao` não ' +
        'são editáveis.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiOkResponse({ type: CameraResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `camera:update`.' }),
    ApiNotFoundResponse({
      description: 'Câmera inexistente ou fora do grupo.',
    }),
    ApiConflictResponse({
      description: 'Stream (icao/node/path) já usado por outra câmera ativa.',
    }),
  );
}
