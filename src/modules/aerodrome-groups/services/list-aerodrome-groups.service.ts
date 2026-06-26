import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';
import { resolveBestEffortPresignedUrl } from '@/modules/storage/utils/resolve-presigned-url';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { ListAerodromeGroupsQueryDTO } from '../dtos/list-aerodrome-groups-query.dto';
import { AerodromeGroupsPaginatedResponseDTO } from '../dtos/aerodrome-groups-paginated-response.dto';
import { AerodromeGroupMapper } from '../mappers/aerodrome-group.mapper';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { buildAerodromeGroupScopedWhere } from '../utils/build-aerodrome-group-where';

const MAX_LIMIT = 200;

@Injectable()
export class ListAerodromeGroupsService {
  constructor(
    private readonly repo: AerodromeGroupRepository,
    private readonly userRepository: UserRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: ListAerodromeGroupsQueryDTO,
    actor: AuthenticatedUser,
  ): Promise<AerodromeGroupsPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);

    /**
     * Escopo por grupo (espelha o web): COORDINATOR só enxerga o próprio grupo
     * (resolvido por consulta — o JWT só tem role); ADMIN vê todos. Ator inativo
     * → 401; COORDINATOR sem grupo (`none`) cai no `where` fail-closed do
     * builder e não enxerga nada — sem "fail open".
     */
    const scope = await resolveActorGroupScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );

    const where = buildAerodromeGroupScopedWhere(query, scope);

    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);

    /** Presigned URL por item, em paralelo e best-effort (falha ⇒ `null`). */
    const rows = await Promise.all(
      items.map(async (item) =>
        AerodromeGroupMapper.toApiRow(
          item,
          await resolveBestEffortPresignedUrl(this.storage, item.imageKey),
        ),
      ),
    );

    return new AerodromeGroupsPaginatedResponseDTO(rows, page, limit, total);
  }
}
