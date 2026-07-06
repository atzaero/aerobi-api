import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UpdateMaintenanceResponseDTO } from '../dtos/maintenance-response.dto';

export function UpdateMaintenanceDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza nome, e-mails autorizados e código de acesso',
      description:
        'Substituição completa do recurso: envie `name` e, se aplicável, `authorizedEmails` ' +
        'no body (campos omitidos não preservam valores anteriores). E-mails vazios desabilitam ' +
        'o acesso público (`securityCode` null). Reenvio inteligente de convites. Requer ' +
        '`maintenance:update` e escopo de grupo.',
    }),
    ApiOkResponse({ type: UpdateMaintenanceResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão `maintenance:update`.',
    }),
    ApiNotFoundResponse({
      description: 'Intervenção inexistente ou fora do escopo.',
    }),
  );
}
