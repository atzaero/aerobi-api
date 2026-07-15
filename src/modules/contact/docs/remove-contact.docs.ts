import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ContactIdResponseDTO } from '../dtos/update-contact-status.dto';

export function RemoveContactDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Remove mensagem de contato (soft delete, ADMIN)',
    }),
    ApiOkResponse({ type: ContactIdResponseDTO }),
    ApiNotFoundResponse(),
    ApiForbiddenResponse(),
  );
}
