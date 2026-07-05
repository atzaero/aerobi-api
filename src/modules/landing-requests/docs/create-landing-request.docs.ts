import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';

import { CreateLandingRequestResponseDTO } from '../dtos/create-landing-request-response.dto';

export function CreateLandingRequestDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({
      summary: 'Envia uma solicitação de pouso (público)',
      description:
        'Envio público (X-API-Key, sem login). Valida a janela operacional, a ' +
        'matrícula, a licença ANAC do piloto e o aeródromo-alvo (existe e ' +
        'aberto); grava a solicitação + o snapshot RAB (matrícula nacional) e ' +
        'envia o comprovante ao piloto. Retorna `{ id, uf }`.',
    }),
    ApiCreatedResponse({ type: CreateLandingRequestResponseDTO }),
    ApiBadRequestResponse({
      description:
        'Validação falhou (janela operacional, matrícula, licença ANAC ou RAB).',
    }),
    ApiNotFoundResponse({ description: 'Aeródromo-alvo não encontrado.' }),
    ApiConflictResponse({
      description: 'Aeródromo fechado para solicitações de pouso.',
    }),
  );
}
