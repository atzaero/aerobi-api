import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';
import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { ListUsersQueryDto } from '../dtos/list-users-query.dto';
import { UsersPaginatedResponseDto } from '../dtos/users-paginated-response.dto';
import { toUserResponse } from '../mappers/user.mapper';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class ListUsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: ListUsersQueryDto,
    actor: AuthenticatedUser,
  ): Promise<UsersPaginatedResponseDto> {
    const { page, limit, skip } = resolvePaginationParams(query, 100);

    // Escopo por grupo (espelha `scopedFilters` do aerobi-web): COORDINATOR é
    // restrito ao próprio grupo (resolvido por consulta — o JWT só tem role);
    // ADMIN vê todos (sem consulta) e pode filtrar livremente por `groupId`.
    const scope = await resolveActorGroupScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );

    // COORDINATOR sem grupo (`none`) não enxerga nada — sem "fail open".
    if (scope.kind === 'none') {
      return new UsersPaginatedResponseDto([], page, limit, 0);
    }

    const groupFilter = scope.kind === 'group' ? scope.groupId : query.groupId; // ADMIN: filtro livre (ou undefined)

    const { rows, total } = await this.userRepository.findManyPaginated({
      skip,
      take: limit,
      ...(query.search !== undefined && { search: query.search }),
      ...(query.role !== undefined && { role: query.role }),
      ...(groupFilter !== undefined && { groupId: groupFilter }),
    });

    return new UsersPaginatedResponseDto(
      rows.map(toUserResponse),
      page,
      limit,
      total,
    );
  }
}
