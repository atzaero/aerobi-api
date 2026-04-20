import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

/**
 * Query params para GET /operational-aerodromes.
 *
 * Extende BasePaginationQueryDTO (page/limit).
 * TODO: adicionar filtros específicos.
 */
export class ListOperationalAerodromesQueryDTO extends BasePaginationQueryDTO {}
