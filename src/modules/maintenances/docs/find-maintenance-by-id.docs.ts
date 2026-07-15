import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { MaintenanceResponseDTO } from '../dtos/maintenance-response.dto';

export function FindMaintenanceByIdDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Detalhe de uma intervenção',
      description:
        'Retorna metadados da intervenção (inclui `securityCode` e e-mails autorizados). ' +
        'Requer `maintenance:read` e escopo de grupo.',
    }),
    ApiOkResponse({ type: MaintenanceResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `maintenance:read`.' }),
    ApiNotFoundResponse({
      description: 'Intervenção inexistente ou fora do escopo.',
    }),
  );
}
