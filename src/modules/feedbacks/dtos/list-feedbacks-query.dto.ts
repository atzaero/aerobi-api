import { IntersectionType } from '@nestjs/swagger';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

import { FeedbackFilterQueryDTO } from './feedback-filter-query.dto';

/**
 * Query de listagem interna: paginação (`page`/`limit`) + os filtros
 * compartilhados de feedback. `IntersectionType` combina os dois DTOs sem
 * duplicar campos.
 */
export class ListFeedbacksQueryDTO extends IntersectionType(
  BasePaginationQueryDTO,
  FeedbackFilterQueryDTO,
) {}
