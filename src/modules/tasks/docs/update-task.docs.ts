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

export function UpdateTaskDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza tarefa',
      description:
        'Substituição completa da tarefa: todos os campos do formulário devem ser enviados ' +
        'no body (valores omitidos não são preservados). Não altera `maintenanceId`. ' +
        'Recalcula `delayWarning` na conclusão. Requer `task:update` e escopo de grupo.',
    }),
    ApiOkResponse({ type: TaskResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `task:update`.' }),
    ApiNotFoundResponse({
      description: 'Tarefa inexistente ou fora do escopo.',
    }),
  );
}
