import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PaginationMetadataUtil } from '@/common/utils/pagination.util';

import { MaintenancesPaginatedResponseDTO } from '../dtos/maintenances-paginated-response.dto';
import { MaintenanceListItemResponseDTO } from '../dtos/maintenance-response.dto';

export function ListMaintenancesDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiExtraModels(
      PaginationMetadataUtil,
      MaintenanceListItemResponseDTO,
      MaintenancesPaginatedResponseDTO,
    ),
    ApiOperation({
      summary: 'Lista intervenções com filtros e contagem de atrasos',
      description:
        'Listagem paginada enriquecida com `overduePendingCount` e ' +
        '`overdueCompletedCount`. Coordinator vê só o próprio grupo. Requer `maintenance:list`.',
    }),
    ApiOkResponse({ type: MaintenancesPaginatedResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `maintenance:list`.' }),
  );
}
