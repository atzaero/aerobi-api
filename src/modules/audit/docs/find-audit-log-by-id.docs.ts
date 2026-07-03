import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { AuditLogResponseDto } from '../dtos/audit-log-response.dto';

export function FindAuditLogByIdDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Detalha um registro de auditoria (ADMIN/COORDINATOR)',
      description:
        'Retorna o registro completo (incluindo `before`/`after`/`metadata`/' +
        '`ipAddress`/`userAgent`). **404** quando inexistente.',
    }),
    ApiOkResponse({ type: AuditLogResponseDto }),
    ApiNotFoundResponse(),
    ApiForbiddenResponse(),
  );
}
