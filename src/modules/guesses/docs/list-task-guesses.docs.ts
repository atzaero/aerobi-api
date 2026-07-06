import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { GuessListItemResponseDTO } from '../dtos/guess.dto';

export function ListTaskGuessesDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Lista palpites de uma tarefa',
      description:
        'Retorna palpites não removidos com filtros opcionais (status, e-mail, texto, ' +
        'período). Requer `task:read` e escopo de grupo.',
    }),
    ApiOkResponse({ type: [GuessListItemResponseDTO] }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `task:read`.' }),
    ApiNotFoundResponse({
      description: 'Tarefa inexistente ou fora do escopo.',
    }),
  );
}
