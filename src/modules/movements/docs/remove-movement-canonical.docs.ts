import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';

import { MovementResponseDTO } from '../dtos/movement-response.dto';

export function RemoveMovementCanonicalDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Remove (soft delete) um movimento por id.' }),
    ApiOkResponse({ type: MovementResponseDTO }),
    ApiNotFoundResponse({ description: 'Movimento não encontrado.' }),
  );
}
