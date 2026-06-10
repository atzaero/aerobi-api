import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';

import { MovementResponseDTO } from '../dtos/movement-response.dto';

export function FindMovementByIdDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      deprecated: true,
      summary: 'DEPRECADO: use GET /movements/:id. Busca um movimento por id.',
    }),
    ApiOkResponse({ type: MovementResponseDTO }),
    ApiNotFoundResponse({ description: 'Leitura não encontrada.' }),
  );
}
