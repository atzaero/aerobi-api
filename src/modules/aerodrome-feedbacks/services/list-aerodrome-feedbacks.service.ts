import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { ListAerodromeFeedbacksQueryDTO } from '../dtos/list-aerodrome-feedbacks-query.dto';
import { AerodromeFeedbacksPaginatedResponseDTO } from '../dtos/aerodrome-feedbacks-paginated-response.dto';
import { AerodromeFeedbackMapper } from '../mappers/aerodrome-feedback.mapper';
import { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';
import { buildAerodromeFeedbackScopedWhere } from '../utils/build-aerodrome-feedback-where';

const MAX_LIMIT = 200;

/**
 * Listagem interna de feedbacks (moderação). Aplica o escopo por grupo do ator:
 * COORDINATOR só vê feedbacks de aeródromos do seu grupo; ADMIN vê todos. Ator
 * inativo → 401; COORDINATOR sem grupo (`none`) cai no `where` fail-closed e não
 * vê nada.
 */
@Injectable()
export class ListAerodromeFeedbacksService {
  constructor(
    private readonly repo: AerodromeFeedbackRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: ListAerodromeFeedbacksQueryDTO,
    actor: AuthenticatedUser,
  ): Promise<AerodromeFeedbacksPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);

    const scope = await resolveActorGroupScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );

    const where = buildAerodromeFeedbackScopedWhere(query, scope);

    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);

    return new AerodromeFeedbacksPaginatedResponseDTO(
      AerodromeFeedbackMapper.toApiRows(items),
      page,
      limit,
      total,
    );
  }
}
