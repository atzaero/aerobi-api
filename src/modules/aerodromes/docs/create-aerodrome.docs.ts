import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CreateAerodromeDTO } from '../dtos/create-aerodrome.dto';
import {
  AERODROME_EXAMPLE_FULL,
  AERODROME_EXAMPLE_MIN_CONSTRUCTION,
  AERODROME_EXAMPLE_MIN_OPERATIONAL,
} from './aerodrome-request.examples';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';

export function CreateAerodromeDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Cria um aeródromo',
      description:
        'Requer `aerodrome:create` (ADMIN, ou COORDINATOR no próprio grupo). ICAO com 4 caracteres alfanuméricos, único no grupo; coordenadas em DMS. Nasce oculto (`isView=false`). A pista é obrigatória quando `construction` não é `true`.',
    }),
    ApiBody({
      type: CreateAerodromeDTO,
      examples: {
        completo: {
          summary: 'Completo (todos os campos)',
          description:
            'Todos os campos, obrigatórios e opcionais, preenchidos.',
          value: AERODROME_EXAMPLE_FULL,
        },
        minimoOperacional: {
          summary: 'Mínimo operacional (obrigatórios + pista)',
          description:
            'Só os obrigatórios. Como não está em construção, os campos de pista são exigidos.',
          value: AERODROME_EXAMPLE_MIN_OPERATIONAL,
        },
        emConstrucao: {
          summary: 'Mínimo em construção (sem pista)',
          description: '`construction: true` dispensa os campos de pista.',
          value: AERODROME_EXAMPLE_MIN_CONSTRUCTION,
        },
      },
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
