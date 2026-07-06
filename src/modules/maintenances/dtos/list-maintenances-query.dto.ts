import { IntersectionType } from '@nestjs/swagger';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

import { MaintenanceFilterQueryDTO } from './maintenance-filter-query.dto';

/**
 * Query de listagem: paginação (`page`/`limit`) + filtros de intervenção.
 */
export class ListMaintenancesQueryDTO extends IntersectionType(
  BasePaginationQueryDTO,
  MaintenanceFilterQueryDTO,
) {}
