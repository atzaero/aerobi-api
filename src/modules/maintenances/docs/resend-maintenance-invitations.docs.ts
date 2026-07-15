import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ResendMaintenanceInvitationsResponseDTO } from '../dtos/resend-maintenance-invitations.dto';

export function ResendMaintenanceInvitationsDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Reenvia convites por e-mail',
      description:
        'Reenvia e-mails de acesso público para um subconjunto de `authorizedEmails`. ' +
        'Não regenera o `securityCode`. Requer `maintenance:update` e escopo de grupo.',
    }),
    ApiOkResponse({ type: ResendMaintenanceInvitationsResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão `maintenance:update`.',
    }),
    ApiNotFoundResponse({
      description: 'Intervenção inexistente ou fora do escopo.',
    }),
  );
}
