import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

/**
 * Swagger para `GET /rab/latest-period` — JWT + RBAC `rab:read`.
 */
export function LatestPeriodDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Último período YYYY-MM listado no índice ANAC (sem gravar)',
      description:
        '**Autenticação:** JWT (Bearer) com permissão `rab:read` ' +
        '(admin/coordinator/operator).',
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `rab:read`.' }),
  );
}
