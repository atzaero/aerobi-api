import { IntersectionType } from '@nestjs/swagger';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

import { LandingRequestFilterQueryDTO } from './landing-request-filter-query.dto';

/**
 * Query do `GET /landing-requests` (moderação interna): paginação +
 * {@link LandingRequestFilterQueryDTO}. O escopo por grupo é aplicado no service
 * (não é um filtro do cliente).
 */
export class ListLandingRequestsQueryDTO extends IntersectionType(
  BasePaginationQueryDTO,
  LandingRequestFilterQueryDTO,
) {}
