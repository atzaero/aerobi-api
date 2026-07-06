import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CreateMaintenanceResponseDTO } from '../dtos/maintenance-response.dto';

export function CreateMaintenanceDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Cria intervenção de manutenção',
      description:
        'Registra uma nova intervenção no aeródromo. Gera `securityCode` quando há ' +
        'e-mails autorizados e dispara convites (best-effort). Requer `maintenance:create`.',
    }),
    ApiCreatedResponse({ type: CreateMaintenanceResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão `maintenance:create`.',
    }),
  );
}
