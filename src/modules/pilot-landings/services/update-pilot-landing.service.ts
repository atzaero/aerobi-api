import { Injectable, NotFoundException } from '@nestjs/common';

import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';
import { UpdatePilotLandingDTO } from '../dtos/update-pilot-landing.dto';
import { PilotLandingMapper } from '../mappers/pilot-landing.mapper';
import { PilotLandingRepository } from '../repositories/pilot-landing.repository';

export type UpdatePilotLandingServiceInput = UpdatePilotLandingDTO & {
  id: string;
};

@Injectable()
export class UpdatePilotLandingService {
  constructor(private readonly repo: PilotLandingRepository) {}

  async execute(
    input: UpdatePilotLandingServiceInput,
  ): Promise<PilotLandingResponseDTO> {
    // TODO: implementar
    const { id, ...data } = input;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`PilotLanding ${id} not found`);
    }
    const updated = await this.repo.update(id, data as never);
    return PilotLandingMapper.toApiRow(updated);
  }
}
