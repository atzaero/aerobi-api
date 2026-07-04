import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PendingCountResponseDTO } from '../dtos/pending-count-response.dto';

export function PendingCountLandingRequestsDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Conta solicitações pendentes no escopo do ator',
      description:
        'Requer `landing_request:list`. Retorna `{ count }` de solicitações ' +
        'pendentes no escopo do ator (substitui o watch-pending por polling).',
    }),
    ApiOkResponse({ type: PendingCountResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão `landing_request:list`.',
    }),
  );
}
