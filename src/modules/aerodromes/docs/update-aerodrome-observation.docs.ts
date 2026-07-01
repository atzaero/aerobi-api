import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';

export function UpdateAerodromeObservationDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza a observação pública do aeródromo',
      description:
        'Requer `aerodrome:update-observation` (ADMIN, COORDINATOR ou OPERATOR). Atualiza apenas `observation` (máx. 2000); vazio ou ausente limpa o campo.',
    }),
    ApiParam({ name: 'id', format: 'uuid', description: 'Identificador' }),
    ApiOkResponse({ type: AerodromeResponseDTO }),
    ApiBadRequestResponse({
      description: 'Observação acima de 2000 caracteres.',
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão `aerodrome:update-observation`.',
    }),
    ApiNotFoundResponse({
      description: 'Inexistente ou fora do escopo do ator.',
    }),
  );
}
