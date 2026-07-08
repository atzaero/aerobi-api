import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resolveOperationalActorScope } from '@/common/utils/group-scope.util';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { ListTechnicalVisitsQueryDTO } from '../dtos/list-technical-visits-query.dto';
import { TechnicalVisitsPaginatedResponseDTO } from '../dtos/technical-visits-paginated-response.dto';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { buildTechnicalVisitScopedWhere } from '../utils/build-technical-visit-scoped-where';
import { toTechnicalVisitApiRows } from '../utils/technical-visit-response';

const MAX_LIMIT = 200;

@Injectable()
export class ListTechnicalVisitsService {
  constructor(
    private readonly repo: TechnicalVisitRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: ListTechnicalVisitsQueryDTO,
    actor: AuthenticatedUser,
  ): Promise<TechnicalVisitsPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);
    const scope = await resolveOperationalActorScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );
    const where = buildTechnicalVisitScopedWhere(query, scope);

    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);

    const data = await toTechnicalVisitApiRows(this.userRepository, items);

    return new TechnicalVisitsPaginatedResponseDTO(data, page, limit, total);
  }
}
