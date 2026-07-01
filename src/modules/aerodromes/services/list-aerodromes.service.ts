import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resolveOperationalActorScope } from '@/common/utils/group-scope.util';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { ListAerodromesQueryDTO } from '../dtos/list-aerodromes-query.dto';
import { AerodromesPaginatedResponseDTO } from '../dtos/aerodromes-paginated-response.dto';
import { AerodromeMapper } from '../mappers/aerodrome.mapper';
import { AerodromeRepository } from '../repositories/aerodrome.repository';
import { buildAerodromeScopedWhere } from '../utils/build-aerodrome-where';

const MAX_LIMIT = 200;

@Injectable()
export class ListAerodromesService {
  constructor(
    private readonly repo: AerodromeRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: ListAerodromesQueryDTO,
    actor: AuthenticatedUser,
  ): Promise<AerodromesPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);

    /**
     * Escopo operacional (espelha `resolveOperationalScope` do web):
     * COORDINATOR/OPERATOR/TECHNICAL só enxergam o próprio grupo; ADMIN vê todos.
     * Ator inativo → 401; papel restrito sem grupo (`none`) cai no `where`
     * fail-closed do builder e não vê nada (sem "fail open").
     */
    const scope = await resolveOperationalActorScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );

    const where = buildAerodromeScopedWhere(query, scope);

    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);

    return new AerodromesPaginatedResponseDTO(
      AerodromeMapper.toApiRows(items),
      page,
      limit,
      total,
    );
  }
}
