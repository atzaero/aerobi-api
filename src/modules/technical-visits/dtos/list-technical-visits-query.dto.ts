import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

/**
 * Query params para GET /technical-visits.
 *
 * Extende BasePaginationQueryDTO (page/limit).
 * TODO: adicionar filtros específicos.
 */
export class ListTechnicalVisitsQueryDTO extends BasePaginationQueryDTO {}
