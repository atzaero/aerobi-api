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

import { CamerasPaginatedResponseDTO } from '../dtos/cameras-paginated-response.dto';
import { CameraResponseDTO } from '../dtos/camera-response.dto';

export function ListCamerasDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiExtraModels(
      PaginationMetadataUtil,
      CameraResponseDTO,
      CamerasPaginatedResponseDTO,
    ),
    ApiOperation({
      summary: 'Lista paginada de câmeras',
      description:
        'Requer `camera:list`. Escopo por grupo: ADMIN vê todas; COORDINATOR ' +
        'só as de aeródromos do próprio grupo. Ordena por `icao`, depois `name`.',
    }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({
      name: 'icao',
      required: false,
      example: 'SBXX',
      description: 'ICAO exato (case-insensitive)',
    }),
    ApiQuery({
      name: 'name',
      required: false,
      description: 'Substring do nome (case-insensitive)',
    }),
    ApiOkResponse({ type: CamerasPaginatedResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `camera:list`.' }),
  );
}
