import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';

export function UpdateAerodromeDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza um aeródromo (edição completa)',
      description:
        'Requer `aerodrome:update` (ADMIN ou COORDINATOR). Edição completa: reenvie todos os campos. COORDINATOR não move o aeródromo entre grupos; ICAO é revalidado.',
    }),
    ApiParam({ name: 'id', format: 'uuid', description: 'Identificador' }),
    ApiOkResponse({ type: AerodromeResponseDTO }),
    ApiBadRequestResponse({
      description: 'Validação falhou ou grupo inválido.',
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão ou tentativa de mover entre grupos.',
    }),
    ApiNotFoundResponse({
      description: 'Inexistente ou fora do escopo do ator.',
    }),
    ApiConflictResponse({
      description: 'Já existe um aeródromo com este ICAO no grupo.',
    }),
  );
}
