import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { MovementsPaginatedResponseDTO } from '../dtos/movements-paginated-response.dto';

export function ListMovementsCanonicalDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary:
        'Lista movimentos (item enxuto p/ card, paginado, filtros opcionais incl. operation_type e source).',
      description:
        'Escopo por grupo: coordinator vê apenas os movimentos dos aeródromos ' +
        'do próprio grupo; admin vê todos.',
    }),
    ApiOkResponse({ type: MovementsPaginatedResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `movement:list`.' }),
  );
}
