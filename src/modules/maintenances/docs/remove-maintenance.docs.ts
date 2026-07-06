import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { MaintenanceDeletionResponseDTO } from '../dtos/maintenance-response.dto';

export function RemoveMaintenanceDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Remove intervenção e tarefas em cascata',
      description:
        'Soft-delete da intervenção e de todas as tarefas ativas. Retorna `deletedTasks`. ' +
        'Somente admin (`maintenance:delete`).',
    }),
    ApiOkResponse({ type: MaintenanceDeletionResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão `maintenance:delete`.',
    }),
    ApiNotFoundResponse({
      description: 'Intervenção inexistente ou fora do escopo.',
    }),
  );
}
