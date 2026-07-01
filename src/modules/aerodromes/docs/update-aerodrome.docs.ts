import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UpdateAerodromeDTO } from '../dtos/update-aerodrome.dto';
import {
  AERODROME_UPDATE_EXAMPLE_FULL,
  AERODROME_UPDATE_EXAMPLE_MIN_OPERATIONAL,
} from './aerodrome-request.examples';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';

export function UpdateAerodromeDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza um aeródromo (edição completa)',
      description:
        'Requer `aerodrome:update` (ADMIN ou COORDINATOR). Edição completa: reenvie todos os campos (opcionais ausentes viram `null`, e `isView` ausente despublica). COORDINATOR não move o aeródromo entre grupos; ICAO é revalidado.',
    }),
    ApiParam({ name: 'id', format: 'uuid', description: 'Identificador' }),
    ApiBody({
      type: UpdateAerodromeDTO,
      examples: {
        completo: {
          summary: 'Completo (todos os campos + isView)',
          description: 'Edição completa mantendo o aeródromo publicado.',
          value: AERODROME_UPDATE_EXAMPLE_FULL,
        },
        minimoOperacional: {
          summary: 'Mínimo operacional (obrigatórios + pista + isView)',
          description:
            'Só os campos obrigatórios; os opcionais omitidos passam a `null`.',
          value: AERODROME_UPDATE_EXAMPLE_MIN_OPERATIONAL,
        },
      },
    }),
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
