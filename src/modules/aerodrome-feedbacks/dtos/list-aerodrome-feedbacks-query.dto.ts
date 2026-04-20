import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

/**
 * Query params para GET /aerodrome-feedbacks.
 *
 * Extende BasePaginationQueryDTO (page/limit).
 * TODO: adicionar filtros específicos.
 */
export class ListAerodromeFeedbacksQueryDTO extends BasePaginationQueryDTO {}
