import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';

import { PaginationMetadataUtil } from '@/common/utils/pagination.util';

import { PublicAerodromeResponseDTO } from '../dtos/public-aerodrome-response.dto';
import { PublicAerodromesPaginatedResponseDTO } from '../dtos/public-aerodromes-paginated-response.dto';

/**
 * Ver `AerobiApiKeyGuard`: em produção (ou dev com auth forçada) exige `X-API-Key`.
 */
export function PublicAerodromesDataDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiExtraModels(
      PaginationMetadataUtil,
      PublicAerodromeResponseDTO,
      PublicAerodromesPaginatedResponseDTO,
    ),
    ApiOperation({
      summary:
        'Consulta paginada de aeródromos públicos (GET /public-aerodromes)',
      description:
        '**Autenticação:** `X-API-Key` = `AEROBI_API_KEY` (exceto bypass em `development`; ver guard). ' +
        'Resposta no formato `{ data, meta }` (padrão paginado; metadados em `meta`). ' +
        'Filtros opcionais usam correspondência parcial case-insensitive (`contains`).',
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
      name: 'ciad',
      required: false,
      description: 'Filtro por código CIAD',
    }),
    ApiQuery({
      name: 'codigoOaci',
      required: false,
      description: 'Filtro por código OACI',
    }),
    ApiQuery({
      name: 'nome',
      required: false,
      description: 'Filtro por nome do aeródromo',
    }),
    ApiQuery({
      name: 'municipio',
      required: false,
      description: 'Filtro por município',
    }),
    ApiQuery({
      name: 'uf',
      required: false,
      description: 'Filtro por UF (estado)',
    }),
    ApiQuery({
      name: 'municipioServido',
      required: false,
      description: 'Filtro por município servido',
    }),
    ApiQuery({
      name: 'ufServido',
      required: false,
      description: 'Filtro por UF servida',
    }),
    ApiQuery({
      name: 'situacao',
      required: false,
      description: 'Filtro por situação',
    }),
    ApiOkResponse({
      description: 'Lista paginada de aeródromos públicos',
      type: PublicAerodromesPaginatedResponseDTO,
    }),
  );
}
