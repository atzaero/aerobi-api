import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { SyncRabResponseDto } from '../dtos/sync-rab-response.dto';

/**
 * Swagger para `POST /rab/sync` — operação administrativa: JWT (Bearer) +
 * role `ADMIN`.
 */
export function SyncDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Disparar sincronização RAB',
      description:
        '**Autenticação:** JWT (Bearer) com role `ADMIN` — operação administrativa (dispara o ETL RAB).',
    }),
    ApiResponse({
      status: 200,
      description: 'Resultado da sync RAB.',
      type: SyncRabResponseDto,
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Requer role `ADMIN`.' }),
  );
}
