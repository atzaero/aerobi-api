import { Injectable } from '@nestjs/common';

import { resolvePaginationParams } from '@/common/utils/pagination-params.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { ListUsersQueryDto } from '../dtos/list-users-query.dto';
import { UsersPaginatedResponseDto } from '../dtos/users-paginated-response.dto';
import { toUserResponse } from '../mappers/user.mapper';
import { UserRepository } from '../repositories/user.repository';
import { resolveUserGroupScope } from '../utils/group-scope.util';

@Injectable()
export class ListUsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    query: ListUsersQueryDto,
    actor: AuthenticatedUser,
  ): Promise<UsersPaginatedResponseDto> {
    const { page, limit, skip } = resolvePaginationParams(query, 100);

    // Escopo por grupo (espelha `scopedFilters` do aerobi-web): COORDINATOR é
    // restrito ao próprio grupo (resolvido por consulta — o JWT só tem role);
    // ADMIN vê todos e pode filtrar livremente por `aerodromeGroupId`.
    const actorRecord = await this.userRepository.findActiveById(actor.id);
    const scope = resolveUserGroupScope(
      actor.role,
      actorRecord?.aerodromeGroupId ?? null,
    );

    // COORDINATOR sem grupo (`none`) não enxerga nada — sem "fail open".
    if (scope.kind === 'none') {
      return new UsersPaginatedResponseDto([], page, limit, 0);
    }

    const groupFilter =
      scope.kind === 'group' ? scope.groupId : query.aerodromeGroupId; // ADMIN: filtro livre (ou undefined)

    const { rows, total } = await this.userRepository.findManyPaginated({
      skip,
      take: limit,
      ...(query.search !== undefined && { search: query.search }),
      ...(query.role !== undefined && { role: query.role }),
      ...(groupFilter !== undefined && { aerodromeGroupId: groupFilter }),
    });

    return new UsersPaginatedResponseDto(
      rows.map(toUserResponse),
      page,
      limit,
      total,
    );
  }
}
