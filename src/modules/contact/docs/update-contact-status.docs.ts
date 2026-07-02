import { applyDecorators, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ContactIdResponseDTO } from '../dtos/update-contact-status.dto';

export function UpdateContactStatusDocs() {
  return applyDecorators(
    Patch(':id/status'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza status de moderação (ADMIN)',
      description: 'Alterna `pending` ↔ `resolved`. No-op se já no status.',
    }),
    ApiOkResponse({ type: ContactIdResponseDTO }),
    ApiNotFoundResponse(),
    ApiForbiddenResponse(),
  );
}
