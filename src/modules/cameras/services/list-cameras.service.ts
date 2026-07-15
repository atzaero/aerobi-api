import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { ListCamerasQueryDTO } from '../dtos/list-cameras-query.dto';
import { CamerasPaginatedResponseDTO } from '../dtos/cameras-paginated-response.dto';
import { CameraMapper } from '../mappers/camera.mapper';
import { CameraRepository } from '../repositories/camera.repository';
import { buildCameraScopedWhere } from '../utils/build-camera-where';

const MAX_LIMIT = 200;

/**
 * Listagem interna de câmeras. Aplica o escopo por grupo do ator: COORDINATOR só
 * vê câmeras de aeródromos do seu grupo; ADMIN vê todas. Ator inativo → 401;
 * COORDINATOR sem grupo (`none`) cai no `where` fail-closed e não vê nada.
 */
@Injectable()
export class ListCamerasService {
  constructor(
    private readonly repo: CameraRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: ListCamerasQueryDTO,
    actor: AuthenticatedUser,
  ): Promise<CamerasPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);

    const scope = await resolveActorGroupScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );

    const where = buildCameraScopedWhere(query, scope);

    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);

    return new CamerasPaginatedResponseDTO(
      CameraMapper.toApiRows(items),
      page,
      limit,
      total,
    );
  }
}
