import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';

import { PaginationMetadataUtil } from '@/common/utils/pagination.util';

import { PilotLandingsPaginatedResponseDTO } from '../dtos/pilot-landings-paginated-response.dto';
import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';

export function ListPilotLandingsDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiExtraModels(
      PaginationMetadataUtil,
      PilotLandingResponseDTO,
      PilotLandingsPaginatedResponseDTO,
    ),
    ApiOperation({ summary: 'Lista paginada de Pilot Landings' }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({
      name: 'operationalAerodromeId',
      required: false,
      format: 'uuid',
      description: 'Filtra pelo aeródromo operacional associado',
    }),
    ApiQuery({
      name: 'registration',
      required: false,
      description:
        'Filtra por substring da matrícula da aeronave (case insensitive)',
      example: 'PT-',
    }),
    ApiOkResponse({ type: PilotLandingsPaginatedResponseDTO }),
  );
}
