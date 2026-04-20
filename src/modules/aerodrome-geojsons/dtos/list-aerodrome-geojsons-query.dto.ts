import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

/**
 * Query params para GET /aerodrome-geojsons.
 *
 * Extende BasePaginationQueryDTO (page/limit).
 * TODO: adicionar filtros específicos.
 */
export class ListAerodromeGeojsonsQueryDTO extends BasePaginationQueryDTO {}
