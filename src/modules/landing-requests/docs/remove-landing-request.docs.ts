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

import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';

export function RemoveLandingRequestDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Remove (soft delete) uma solicitação de pouso',
      description:
        'Requer `landing_request:delete` (ADMIN-only) + escopo por grupo. ' +
        'Grava o ator real em `deletedBy`.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiOkResponse({ type: LandingRequestResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão `landing_request:delete`.',
    }),
    ApiNotFoundResponse({
      description: 'Solicitação não encontrada ou fora do escopo.',
    }),
  );
}
