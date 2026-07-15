import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { TaskResponseDTO } from '../dtos/task.dto';

export function FindTaskByIdDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Detalhe de uma tarefa',
      description:
        'Inclui campos de conclusão e `suggestionCount`. Requer `task:read` e escopo de grupo.',
    }),
    ApiOkResponse({ type: TaskResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `task:read`.' }),
    ApiNotFoundResponse({
      description: 'Tarefa inexistente ou fora do escopo.',
    }),
  );
}
