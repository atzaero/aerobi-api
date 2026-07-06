import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UpdateGuessStatusResponseDTO } from '../dtos/guess.dto';

export function UpdateGuessStatusDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza status de moderação de um palpite',
      description:
        'Status: `pending`, `considered` ou `dismissed`. Requer `task:update` e escopo ' +
        'de grupo via palpite.',
    }),
    ApiOkResponse({ type: UpdateGuessStatusResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `task:update`.' }),
    ApiNotFoundResponse({
      description: 'Palpite inexistente ou fora do escopo.',
    }),
  );
}
