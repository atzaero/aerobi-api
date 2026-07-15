import { IntersectionType } from '@nestjs/swagger';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

import { MovementFilterQueryDTO } from './movement-filter-query.dto';

/**
 * Query de `GET /movements` (e do alias deprecado `GET /readings`): combina a
 * paginação (`page`/`limit`) com os filtros de movimentos compartilhados
 * (`MovementFilterQueryDTO`) — os mesmos usados pelo export CSV.
 */
export class ListMovementsQueryDTO extends IntersectionType(
  BasePaginationQueryDTO,
  MovementFilterQueryDTO,
) {}
