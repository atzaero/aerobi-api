import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { MovementsPaginatedResponseDTO } from '../dtos/movements-paginated-response.dto';

export function ListMovementsDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      deprecated: true,
      summary:
        'DEPRECADO: use GET /movements. Lista movimentos (item enxuto, paginado, filtros opcionais incl. operation_type e source).',
    }),
    ApiOkResponse({ type: MovementsPaginatedResponseDTO }),
  );
}
