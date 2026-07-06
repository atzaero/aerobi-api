import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CreateTaskResponseDTO } from '../dtos/task.dto';

export function CreateTaskDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Cria tarefa em uma intervenção',
      description:
        'Body inclui `maintenanceId` e campos do formulário de tarefa. ' +
        'Requer `task:create` e escopo da intervenção.',
    }),
    ApiCreatedResponse({ type: CreateTaskResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `task:create`.' }),
    ApiNotFoundResponse({
      description: 'Intervenção inexistente ou fora do escopo.',
    }),
  );
}
