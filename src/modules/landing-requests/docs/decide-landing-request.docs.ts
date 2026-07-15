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

import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';

export function DecideLandingRequestDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Decide uma solicitação de pouso (aprovar/recusar)',
      description:
        'Requer `landing_request:decide` + escopo por grupo. Transição ' +
        '`PENDING → APPROVED/REJECTED`; re-decisão retorna 409. Grava o ator ' +
        'real (`reviewedBy`) e notifica o solicitante (best-effort).',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiOkResponse({ type: LandingRequestResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão `landing_request:decide`.',
    }),
    ApiNotFoundResponse({
      description: 'Solicitação não encontrada ou fora do escopo.',
    }),
    ApiConflictResponse({ description: 'Solicitação já respondida.' }),
  );
}
