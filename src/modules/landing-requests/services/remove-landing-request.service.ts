import { Injectable, NotFoundException } from '@nestjs/common';

import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { LandingRequestMapper } from '../mappers/landing-request.mapper';
import { LandingRequestRepository } from '../repositories/landing-request.repository';

export type RemoveLandingRequestServiceInput = {
  id: string;
  deletedBy: string;
};

@Injectable()
export class RemoveLandingRequestService {
  constructor(private readonly repo: LandingRequestRepository) {}

  async execute(
    input: RemoveLandingRequestServiceInput,
  ): Promise<LandingRequestResponseDTO> {
    // TODO: implementar (soft delete)
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new NotFoundException(`LandingRequest ${input.id} not found`);
    }
    const deleted = await this.repo.softDelete(input.id, input.deletedBy);
    return LandingRequestMapper.toApiRow(deleted);
  }
}
