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
import { Uf } from '@/generated/prisma/client';

import { AerodromeGroupsPaginatedResponseDTO } from '../dtos/aerodrome-groups-paginated-response.dto';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';

export function ListAerodromeGroupsDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiExtraModels(
      PaginationMetadataUtil,
      AerodromeGroupResponseDTO,
      AerodromeGroupsPaginatedResponseDTO,
    ),
    ApiOperation({
      summary: 'Lista paginada de Aerodrome Groups',
      description:
        'Requer `group:list`. COORDINATOR enxerga apenas o próprio grupo; ' +
        'ADMIN vê todos. Ordenado por `createdAt` desc.',
    }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({
      name: 'uf',
      required: false,
      enum: Uf,
      description: 'Filtra pelo estado',
    }),
    ApiQuery({
      name: 'name',
      required: false,
      description: 'Filtra por nome do grupo (substring, case-insensitive)',
    }),
    ApiOkResponse({ type: AerodromeGroupsPaginatedResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `group:list`.' }),
  );
}
