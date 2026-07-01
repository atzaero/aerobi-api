import { IntersectionType } from '@nestjs/swagger';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

import { AerodromeFeedbackFilterQueryDTO } from './aerodrome-feedback-filter-query.dto';

/**
 * Query de listagem interna: paginação (`page`/`limit`) + os filtros
 * compartilhados de feedback. `IntersectionType` combina os dois DTOs sem
 * duplicar campos.
 */
export class ListAerodromeFeedbacksQueryDTO extends IntersectionType(
  BasePaginationQueryDTO,
  AerodromeFeedbackFilterQueryDTO,
) {}
