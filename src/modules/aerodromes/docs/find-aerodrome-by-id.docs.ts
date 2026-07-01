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

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';

export function FindAerodromeByIdDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Busca um aeródromo por ID',
      description:
        'Requer `aerodrome:read`. Escopo por grupo: ADMIN acessa qualquer aeródromo; COORDINATOR/OPERATOR/TECHNICAL só o do próprio grupo.',
    }),
    ApiParam({ name: 'id', format: 'uuid', description: 'Identificador' }),
    ApiOkResponse({ type: AerodromeResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `aerodrome:read`.' }),
    ApiNotFoundResponse({
      description: 'Inexistente ou fora do escopo do ator.',
    }),
  );
}
