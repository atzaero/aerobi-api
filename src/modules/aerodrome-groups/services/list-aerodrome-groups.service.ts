import { Injectable } from '@nestjs/common';

import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';
import type { Prisma } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { ListAerodromeGroupsQueryDTO } from '../dtos/list-aerodrome-groups-query.dto';
import { AerodromeGroupsPaginatedResponseDTO } from '../dtos/aerodrome-groups-paginated-response.dto';
import { AerodromeGroupMapper } from '../mappers/aerodrome-group.mapper';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';

const MAX_LIMIT = 200;

@Injectable()
export class ListAerodromeGroupsService {
  constructor(
    private readonly repo: AerodromeGroupRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    query: ListAerodromeGroupsQueryDTO,
    actor: AuthenticatedUser,
  ): Promise<AerodromeGroupsPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);

    /**
     * Escopo por grupo (espelha o web): COORDINATOR só enxerga o próprio grupo
     * (resolvido por consulta — o JWT só tem role); ADMIN vê todos. COORDINATOR
     * sem grupo (`none`) não enxerga nada — sem "fail open".
     */
    const scope = await resolveActorGroupScope(actor.role, actor.id, (id) =>
      this.userRepository.findActiveById(id),
    );

    if (scope.kind === 'none') {
      return new AerodromeGroupsPaginatedResponseDTO([], page, limit, 0);
    }

    const where: Prisma.AerodromeGroupWhereInput = {};
    if (query.uf !== undefined) {
      where.uf = query.uf;
    }
    if (query.name !== undefined) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }
    /** O grupo do coordinator **é** o registro: força o id ao próprio grupo. */
    if (scope.kind === 'group') {
      where.id = scope.groupId;
    }

    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);

    return new AerodromeGroupsPaginatedResponseDTO(
      AerodromeGroupMapper.toApiRows(items),
      page,
      limit,
      total,
    );
  }
}
