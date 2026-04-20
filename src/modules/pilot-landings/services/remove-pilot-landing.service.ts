import { Injectable, NotFoundException } from '@nestjs/common';

import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';
import { PilotLandingMapper } from '../mappers/pilot-landing.mapper';
import { PilotLandingRepository } from '../repositories/pilot-landing.repository';

export type RemovePilotLandingServiceInput = { id: string; deletedBy: string };

@Injectable()
export class RemovePilotLandingService {
  constructor(private readonly repo: PilotLandingRepository) {}

  async execute(
    input: RemovePilotLandingServiceInput,
  ): Promise<PilotLandingResponseDTO> {
    // TODO: implementar (soft delete)
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new NotFoundException(`PilotLanding ${input.id} not found`);
    }
    const deleted = await this.repo.softDelete(input.id, input.deletedBy);
    return PilotLandingMapper.toApiRow(deleted);
  }
}
