import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';

import { PaginationMetadataUtil } from '@/common/utils/pagination.util';
import { Uf } from '@/generated/prisma/client';

import { AerodromeGroupsPaginatedResponseDTO } from '../dtos/aerodrome-groups-paginated-response.dto';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';

export function ListAerodromeGroupsDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiExtraModels(
      PaginationMetadataUtil,
      AerodromeGroupResponseDTO,
      AerodromeGroupsPaginatedResponseDTO,
    ),
    ApiOperation({ summary: 'Lista paginada de Aerodrome Groups' }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({
      name: 'uf',
      required: false,
      enum: Uf,
      description: 'Filtra pelo estado',
    }),
    ApiOkResponse({ type: AerodromeGroupsPaginatedResponseDTO }),
  );
}
