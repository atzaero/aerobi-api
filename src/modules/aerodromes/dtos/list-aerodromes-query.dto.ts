import { IntersectionType } from '@nestjs/swagger';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

import { AerodromeFilterQueryDTO } from './aerodrome-filter-query.dto';

/**
 * Query de listagem: paginação (`page`/`limit`) + os filtros compartilhados de
 * aeródromo. `IntersectionType` combina os dois DTOs sem duplicar os campos.
 */
export class ListAerodromesQueryDTO extends IntersectionType(
  BasePaginationQueryDTO,
  AerodromeFilterQueryDTO,
) {}
