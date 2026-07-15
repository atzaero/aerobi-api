import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resolveOperationalActorScope } from '@/common/utils/group-scope.util';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { ListGeojsonsQueryDTO } from '../dtos/list-geojsons-query.dto';
import { GeojsonsPaginatedResponseDTO } from '../dtos/geojsons-paginated-response.dto';
import { GeojsonMapper } from '../mappers/geojson.mapper';
import { GeojsonRepository } from '../repositories/geojson.repository';
import { buildGeojsonScopedWhere } from '../utils/build-geojson-where';

const MAX_LIMIT = 200;

/**
 * Listagem administrativa de GeoJSONs (superset do web). Aplica o escopo
 * **operacional** por grupo (COORDINATOR + OPERATOR + TECHNICAL restritos ao
 * próprio grupo; ADMIN vê tudo; papel restrito sem grupo cai no `where`
 * fail-closed). O `deletedAt: null` fica no repositório.
 */
@Injectable()
export class ListGeojsonsService {
  constructor(
    private readonly repo: GeojsonRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: ListGeojsonsQueryDTO,
    actor: AuthenticatedUser,
  ): Promise<GeojsonsPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);

    const scope = await resolveOperationalActorScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );
    const where = buildGeojsonScopedWhere(query, scope);

    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);

    return new GeojsonsPaginatedResponseDTO(
      GeojsonMapper.toApiRows(items),
      page,
      limit,
      total,
    );
  }
}
