import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { LandingRequestMapper } from '../mappers/landing-request.mapper';
import { LandingRequestRepository } from '../repositories/landing-request.repository';
import { resolveReviewersById } from '../utils/resolve-reviewers';

/**
 * Busca uma solicitação por id (moderação). O escopo por grupo é garantido pelo
 * `GroupScopeGuard` no controller (404 uniforme fora do escopo); aqui só
 * resolvemos existência, incluímos o snapshot RAB (`rabAircraft`), resolvemos o
 * revisor e mascaramos o CPF no mapper.
 */
@Injectable()
export class FindLandingRequestByIdService {
  constructor(
    private readonly repo: LandingRequestRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(id: string): Promise<LandingRequestResponseDTO> {
    const entity = await this.repo.findById(id);
    if (!entity) {
      throw resourceNotFound(
        this.errorMessageService,
        'Solicitação de pouso',
        id,
      );
    }

    const reviewersById = await resolveReviewersById(this.userRepository, [
      entity.reviewedBy,
    ]);
    const reviewer = entity.reviewedBy
      ? (reviewersById.get(entity.reviewedBy) ?? null)
      : null;

    return LandingRequestMapper.toApiRow(entity, {
      reviewer,
      aircraft: entity.aircraft,
    });
  }
}
