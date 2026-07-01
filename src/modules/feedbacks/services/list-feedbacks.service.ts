import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { ListFeedbacksQueryDTO } from '../dtos/list-feedbacks-query.dto';
import { FeedbacksPaginatedResponseDTO } from '../dtos/feedbacks-paginated-response.dto';
import { FeedbackMapper } from '../mappers/feedback.mapper';
import { FeedbackRepository } from '../repositories/feedback.repository';
import { buildFeedbackScopedWhere } from '../utils/build-feedback-where';

const MAX_LIMIT = 200;

/**
 * Listagem interna de feedbacks (moderação). Aplica o escopo por grupo do ator:
 * COORDINATOR só vê feedbacks de aeródromos do seu grupo; ADMIN vê todos. Ator
 * inativo → 401; COORDINATOR sem grupo (`none`) cai no `where` fail-closed e não
 * vê nada.
 */
@Injectable()
export class ListFeedbacksService {
  constructor(
    private readonly repo: FeedbackRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: ListFeedbacksQueryDTO,
    actor: AuthenticatedUser,
  ): Promise<FeedbacksPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);

    const scope = await resolveActorGroupScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );

    const where = buildFeedbackScopedWhere(query, scope);

    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);

    return new FeedbacksPaginatedResponseDTO(
      FeedbackMapper.toApiRows(items),
      page,
      limit,
      total,
    );
  }
}
