import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { MovementsPaginatedResponseDTO } from '../dtos/movements-paginated-response.dto';

export function ListMovementsCanonicalDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary:
        'Lista movimentos (item enxuto p/ card, paginado, filtros opcionais incl. operation_type e source).',
    }),
    ApiOkResponse({ type: MovementsPaginatedResponseDTO }),
  );
}
