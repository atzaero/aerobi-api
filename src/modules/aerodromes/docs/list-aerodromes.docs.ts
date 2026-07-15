import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PaginationMetadataUtil } from '@/common/utils/pagination.util';

import { AerodromesPaginatedResponseDTO } from '../dtos/aerodromes-paginated-response.dto';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';

export function ListAerodromesDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiExtraModels(
      PaginationMetadataUtil,
      AerodromeResponseDTO,
      AerodromesPaginatedResponseDTO,
    ),
    ApiOperation({
      summary: 'Lista aeródromos (paginado)',
      description:
        'Requer `aerodrome:list`. Escopo operacional: ADMIN vê todos; COORDINATOR/OPERATOR/TECHNICAL só o próprio grupo. Ordenado por `createdAt` desc.',
    }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({
      name: 'uf',
      required: false,
      description: 'Filtra pela UF do grupo',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      description: 'Substring (case-insensitive) em ICAO, nome ou município',
      example: 'SD',
    }),
    ApiQuery({
      name: 'isOpen',
      required: false,
      enum: ['true', 'false'],
      description: 'Filtra por aeródromo aberto',
    }),
    ApiQuery({
      name: 'isView',
      required: false,
      enum: ['true', 'false'],
      description: 'Filtra por visibilidade pública',
    }),
    ApiQuery({
      name: 'groupId',
      required: false,
      format: 'uuid',
      description: 'Filtra pelo grupo (efetivo apenas para ADMIN)',
    }),
    ApiOkResponse({ type: AerodromesPaginatedResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `aerodrome:list`.' }),
  );
}
