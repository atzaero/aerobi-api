import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';

import { PublicMaintenanceFeedbackResponseDTO } from '../dtos/public/public-maintenance-feedback-response.dto';

export function GetPublicMaintenanceFeedbackDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'View pública de feedback da intervenção',
      description:
        'Sem autenticação JWT. Retorna 404 quando a intervenção não existe ou não tem ' +
        'acesso público ativo. Nunca expõe `securityCode` nem `authorizedEmails` — apenas ' +
        '`authorizedEmailsCount`. Query `email` opcional habilita flags `emailAuthorized` e ' +
        '`canSubmitGuess`.',
    }),
    ApiOkResponse({ type: PublicMaintenanceFeedbackResponseDTO }),
    ApiTooManyRequestsResponse({
      description: 'Rate limit por IP excedido.',
    }),
    ApiNotFoundResponse({
      description: 'Intervenção inexistente ou sem acesso público.',
    }),
  );
}
