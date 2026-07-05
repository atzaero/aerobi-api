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

export function FindLandingRequestByIdDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Busca uma solicitação de pouso por id (moderação)',
      description:
        'Requer `landing_request:read` + escopo por grupo. Inclui o snapshot ' +
        'RAB (`rabAircraft`); CPF mascarado. Fora do escopo → 404 uniforme.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiOkResponse({ type: LandingRequestResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão `landing_request:read`.',
    }),
    ApiNotFoundResponse({
      description: 'Solicitação não encontrada ou fora do escopo.',
    }),
  );
}
