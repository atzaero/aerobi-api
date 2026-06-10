import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { MovementsPaginatedResponseDTO } from '../dtos/movements-paginated-response.dto';

export function ListMovementsCanonicalDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Lista movimentos (paginado, filtros opcionais).',
    }),
    ApiOkResponse({ type: MovementsPaginatedResponseDTO }),
  );
}
