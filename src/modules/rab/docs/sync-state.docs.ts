import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

/**
 * Swagger para `GET /rab/sync-state` — operação administrativa: JWT (Bearer) +
 * role `ADMIN`.
 */
export function SyncStateDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Estados de sincronização por período',
      description:
        '**Autenticação:** JWT (Bearer) com role `ADMIN` — operação administrativa.',
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Requer role `ADMIN`.' }),
  );
}
