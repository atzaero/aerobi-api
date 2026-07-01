import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';

export function RemoveAerodromeFeedbackDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Remove (soft delete) um feedback por id (moderação)',
      description:
        'Requer `feedback:delete`. Escopo por grupo: ADMIN remove qualquer ' +
        'feedback; COORDINATOR só os de aeródromos do próprio grupo. Registra o ' +
        'ator em `deletedBy`.',
    }),
    ApiParam({ name: 'id', format: 'uuid', description: 'Identificador' }),
    ApiOkResponse({ type: AerodromeFeedbackResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `feedback:delete`.' }),
    ApiNotFoundResponse({
      description: 'Inexistente ou fora do escopo do ator.',
    }),
  );
}
