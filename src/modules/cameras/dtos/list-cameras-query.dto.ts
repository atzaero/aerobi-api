import { IntersectionType } from '@nestjs/swagger';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

import { CameraFilterQueryDTO } from './camera-filter-query.dto';

/**
 * Query de listagem: paginação (`page`/`limit`) + filtros de câmera
 * (`icao`/`name`). `IntersectionType` combina os dois DTOs sem duplicar campos.
 */
export class ListCamerasQueryDTO extends IntersectionType(
  BasePaginationQueryDTO,
  CameraFilterQueryDTO,
) {}
