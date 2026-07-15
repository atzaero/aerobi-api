import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resolveOperationalActorScope } from '@/common/utils/group-scope.util';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { LandingRequestsPaginatedResponseDTO } from '../dtos/landing-requests-paginated-response.dto';
import { ListLandingRequestsQueryDTO } from '../dtos/list-landing-requests-query.dto';
import { LandingRequestMapper } from '../mappers/landing-request.mapper';
import { LandingRequestRepository } from '../repositories/landing-request.repository';
import { buildLandingRequestScopedWhere } from '../utils/build-landing-request-where';
import { resolveLandingRequestOrderBy } from '../utils/list-order';
import { resolveReviewersById } from '../utils/resolve-reviewers';

const MAX_LIMIT = 200;

/**
 * Listagem interna de solicitações de pouso (moderação). Aplica o escopo
 * **operacional** por grupo (COORDINATOR + OPERATOR restritos ao próprio grupo;
 * ADMIN vê tudo; papel restrito sem grupo cai no `where` fail-closed). A
 * ordenação canônica pendentes-FIFO vem do repositório; o CPF é mascarado no
 * mapper.
 */
@Injectable()
export class ListLandingRequestsService {
  constructor(
    private readonly repo: LandingRequestRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: ListLandingRequestsQueryDTO,
    actor: AuthenticatedUser,
  ): Promise<LandingRequestsPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);

    const scope = await resolveOperationalActorScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );
    const where = buildLandingRequestScopedWhere(query, scope);
    const orderBy = resolveLandingRequestOrderBy(query.status);

    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit, orderBy),
      this.repo.count(where),
    ]);

    const reviewersById = await resolveReviewersById(
      this.userRepository,
      items.map((item) => item.reviewedBy),
    );

    return new LandingRequestsPaginatedResponseDTO(
      LandingRequestMapper.toApiRows(items, reviewersById),
      page,
      limit,
      total,
    );
  }
}
