import { Injectable, NotFoundException } from '@nestjs/common';

import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';
import { PilotLandingMapper } from '../mappers/pilot-landing.mapper';
import { PilotLandingRepository } from '../repositories/pilot-landing.repository';

export type FindPilotLandingByIdServiceInput = { id: string };

@Injectable()
export class FindPilotLandingByIdService {
  constructor(private readonly repo: PilotLandingRepository) {}

  async execute(
    input: FindPilotLandingByIdServiceInput,
  ): Promise<PilotLandingResponseDTO> {
    // TODO: implementar
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new NotFoundException(`PilotLanding ${input.id} not found`);
    }
    return PilotLandingMapper.toApiRow(entity);
  }
}
