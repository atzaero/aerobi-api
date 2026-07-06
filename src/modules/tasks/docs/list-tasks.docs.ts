import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PaginationMetadataUtil } from '@/common/utils/pagination.util';

import { TasksPaginatedResponseDTO } from '../dtos/tasks-paginated-response.dto';
import { TaskResponseDTO } from '../dtos/task.dto';

export function ListTasksDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiExtraModels(
      PaginationMetadataUtil,
      TaskResponseDTO,
      TasksPaginatedResponseDTO,
    ),
    ApiOperation({
      summary: 'Lista tarefas de uma intervenção',
      description:
        'Query obrigatória `maintenanceId` + filtros opcionais (situação, urgência, etc.). ' +
        'Requer `task:list` e escopo da intervenção.',
    }),
    ApiQuery({
      name: 'maintenanceId',
      required: true,
      format: 'uuid',
      description: 'Intervenção dona das tarefas',
    }),
    ApiOkResponse({ type: TasksPaginatedResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `task:list`.' }),
    ApiNotFoundResponse({
      description: 'Intervenção inexistente ou fora do escopo.',
    }),
  );
}
