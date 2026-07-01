import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { AerodromeMapper } from '../mappers/aerodrome.mapper';
import { AerodromeRepository } from '../repositories/aerodrome.repository';

export type FindAerodromeByIdServiceInput = { id: string };

@Injectable()
export class FindAerodromeByIdService {
  constructor(
    private readonly repo: AerodromeRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: FindAerodromeByIdServiceInput,
  ): Promise<AerodromeResponseDTO> {
    /** Escopo por grupo já validado pelo `GroupScopeGuard`; aqui só a existência. */
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw resourceNotFound(this.errorMessageService, 'Aeródromo', input.id);
    }
    return AerodromeMapper.toApiRow(entity);
  }
}
