import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { TaskDeletionResponseDTO } from '../dtos/task.dto';

export function RemoveTaskDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Remove tarefa (soft delete)',
      description: 'Somente admin (`task:delete`).',
    }),
    ApiOkResponse({ type: TaskDeletionResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `task:delete`.' }),
    ApiNotFoundResponse({
      description: 'Tarefa inexistente ou fora do escopo.',
    }),
  );
}
