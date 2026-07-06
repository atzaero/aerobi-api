import { applyDecorators } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CreatePublicGuessResponseDTO } from '../dtos/public/create-public-guess.dto';

export function CreatePublicMaintenanceGuessDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Envia palpite público para uma tarefa',
      description:
        'Sem autenticação JWT. Valida `securityCode` (case-sensitive), e-mail autorizado ' +
        '(case-insensitive) e FK da tarefa. Grava palpite com status `pending`.',
    }),
    ApiCreatedResponse({ type: CreatePublicGuessResponseDTO }),
    ApiTooManyRequestsResponse({
      description: 'Rate limit por IP excedido.',
    }),
    ApiUnauthorizedResponse({
      description: 'Código de segurança ou e-mail inválido.',
    }),
    ApiNotFoundResponse({
      description: 'Intervenção ou tarefa inexistente / invisível.',
    }),
  );
}
