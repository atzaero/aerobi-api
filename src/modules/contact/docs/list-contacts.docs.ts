import { applyDecorators, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ContactsPaginatedResponseDTO } from '../dtos/contacts-paginated-response.dto';

export function ListContactsDocs() {
  return applyDecorators(
    Get(),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Lista mensagens de contato (ADMIN)',
      description:
        'Moderação admin com filtros `type`/`status`/`email`/`phone`/`startDate`/`endDate`.',
    }),
    ApiOkResponse({ type: ContactsPaginatedResponseDTO }),
    ApiForbiddenResponse(),
  );
}
