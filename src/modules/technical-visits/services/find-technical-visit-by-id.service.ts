import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { toTechnicalVisitApiRow } from '../utils/technical-visit-response';
import { UserRepository } from '@/modules/users/repositories/user.repository';

export type FindTechnicalVisitByIdServiceInput = { id: string };

@Injectable()
export class FindTechnicalVisitByIdService {
  constructor(
    private readonly repo: TechnicalVisitRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: FindTechnicalVisitByIdServiceInput,
  ): Promise<TechnicalVisitResponseDTO> {
    const entity = await this.repo.findByIdWithAerodrome(input.id);
    if (!entity) {
      throw resourceNotFound(
        this.errorMessageService,
        'Visita técnica',
        input.id,
      );
    }
    return toTechnicalVisitApiRow(this.userRepository, entity);
  }
}
