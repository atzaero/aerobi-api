import { Injectable, NotFoundException } from '@nestjs/common';

import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { UpdateLandingRequestDTO } from '../dtos/update-landing-request.dto';
import { LandingRequestMapper } from '../mappers/landing-request.mapper';
import { LandingRequestRepository } from '../repositories/landing-request.repository';

export type UpdateLandingRequestServiceInput = UpdateLandingRequestDTO & {
  id: string;
};

@Injectable()
export class UpdateLandingRequestService {
  constructor(private readonly repo: LandingRequestRepository) {}

  async execute(
    input: UpdateLandingRequestServiceInput,
  ): Promise<LandingRequestResponseDTO> {
    // TODO: implementar
    const { id, ...data } = input;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`LandingRequest ${id} not found`);
    }
    const updated = await this.repo.update(id, data as never);
    return LandingRequestMapper.toApiRow(updated);
  }
}
