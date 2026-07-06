import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { RemoveGuessResponseDTO } from '../dtos/guess.dto';

export function RemoveGuessDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Remove palpite (soft-delete)',
      description:
        'Soft-delete de um palpite. Requer `task:delete` e escopo de grupo via palpite.',
    }),
    ApiOkResponse({ type: RemoveGuessResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `task:delete`.' }),
    ApiNotFoundResponse({
      description: 'Palpite inexistente ou fora do escopo.',
    }),
  );
}
