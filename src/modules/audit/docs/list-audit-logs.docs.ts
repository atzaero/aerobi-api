import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { AuditLogsPaginatedResponseDto } from '../dtos/audit-logs-paginated-response.dto';

export function ListAuditLogsDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Lista registros de auditoria paginados (ADMIN/COORDINATOR)',
      description:
        'Trilha append-only das ações de escrita. Filtros por igualdade exata ' +
        '(`entityType`, `actorEmail`, `action`) e range `from`/`to` (ms desde ' +
        'epoch, inclusivo) sobre `createdAt`; ordena `createdAt DESC`. **Sem ' +
        'escopo de grupo**: ADMIN e COORDINATOR veem todos os logs (paridade ' +
        'com o aerobi-web).',
    }),
    ApiOkResponse({ type: AuditLogsPaginatedResponseDto }),
    ApiForbiddenResponse(),
  );
}
