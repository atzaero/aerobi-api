import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';

export function CreateAerodromeDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Cria um aeródromo',
      description:
        'Requer `aerodrome:create` (ADMIN, ou COORDINATOR no próprio grupo). ICAO com 4 caracteres alfanuméricos, único no grupo; coordenadas em DMS. Nasce oculto (`isView=false`).',
    }),
    ApiCreatedResponse({ type: AerodromeResponseDTO }),
    ApiBadRequestResponse({
      description: 'Validação falhou ou grupo inválido.',
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({
      description: 'Sem permissão ou fora do próprio grupo.',
    }),
    ApiConflictResponse({
      description: 'Já existe um aeródromo com este ICAO no grupo.',
    }),
  );
}
