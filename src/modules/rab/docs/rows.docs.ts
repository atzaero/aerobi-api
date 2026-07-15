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

import { RabRowResponseDTO } from '../dtos/rab-row-response.dto';
import { RabRowsPaginatedResponseDTO } from '../dtos/rab-rows-paginated-response.dto';

/**
 * Swagger para `GET /rab/rows` — JWT + RBAC `rab:read`.
 */
export function RowsDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiExtraModels(
      PaginationMetadataUtil,
      RabRowResponseDTO,
      RabRowsPaginatedResponseDTO,
    ),
    ApiOperation({
      summary:
        'Consulta paginada de linhas RAB por período (dados abertos ANAC)',
      description:
        '**Autenticação:** JWT (Bearer) com permissão `rab:read` ' +
        '(admin/coordinator/operator). ' +
        'Resposta no formato `{ data, meta }` (padrão paginado; metadados em `meta`). ' +
        'Filtros opcionais usam correspondência parcial case-insensitive (`contains`).',
    }),
    ApiQuery({
      name: 'period',
      required: false,
      example: '2026-03',
      description:
        'Período de referência (YYYY-MM). Se omitido, usa o período mais recente do índice ANAC (mesmo critério de GET /rab/latest-period).',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      example: 1,
      description: 'Número da página (1-based)',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      example: 10,
      description: 'Itens por página (máx. 200)',
    }),
    ApiQuery({
      name: 'marcas',
      required: false,
      description: 'Filtro por matrícula (marcas)',
    }),
    ApiQuery({
      name: 'nrCertMatricula',
      required: false,
      description: 'Filtro por número certificado de matrícula',
    }),
    ApiQuery({
      name: 'nmFabricante',
      required: false,
      description: 'Filtro por fabricante',
    }),
    ApiQuery({
      name: 'dsModelo',
      required: false,
      description: 'Filtro por modelo',
    }),
    ApiQuery({
      name: 'cdTipoIcao',
      required: false,
      description: 'Filtro por tipo ICAO',
    }),
    ApiOkResponse({
      description: 'Lista paginada de linhas RAB',
      type: RabRowsPaginatedResponseDTO,
    }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `rab:read`.' }),
  );
}
