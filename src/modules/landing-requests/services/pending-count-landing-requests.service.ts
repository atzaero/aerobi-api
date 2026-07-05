import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resolveOperationalActorScope } from '@/common/utils/group-scope.util';
import { LandingRequestStatus } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { LandingRequestFilterQueryDTO } from '../dtos/landing-request-filter-query.dto';
import { PendingCountResponseDTO } from '../dtos/pending-count-response.dto';
import { LandingRequestRepository } from '../repositories/landing-request.repository';
import { buildLandingRequestScopedWhere } from '../utils/build-landing-request-where';

/** Filtro vazio: a contagem considera só o escopo do ator + status PENDING. */
const NO_FILTERS = new LandingRequestFilterQueryDTO();

/**
 * Contagem de solicitações **pendentes** no escopo do ator — substitui o
 * `watch-pending` em tempo real do web por polling (`GET /pending-count`; SSE
 * fica como follow-up). Mesmo escopo operacional da listagem.
 */
@Injectable()
export class PendingCountLandingRequestsService {
  constructor(
    private readonly repo: LandingRequestRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(actor: AuthenticatedUser): Promise<PendingCountResponseDTO> {
    const scope = await resolveOperationalActorScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );
    const where = {
      ...buildLandingRequestScopedWhere(NO_FILTERS, scope),
      status: LandingRequestStatus.PENDING,
    };

    const count = await this.repo.count(where);
    return { count };
  }
}
