import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

/**
 * Query params para GET /aerodrome-groups.
 *
 * Extende BasePaginationQueryDTO (page/limit).
 * TODO: adicionar filtros específicos.
 */
export class ListAerodromeGroupsQueryDTO extends BasePaginationQueryDTO {}
