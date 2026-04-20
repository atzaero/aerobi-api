import { Injectable, NotFoundException } from '@nestjs/common';

import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { LandingRequestMapper } from '../mappers/landing-request.mapper';
import { LandingRequestRepository } from '../repositories/landing-request.repository';

export type FindLandingRequestByIdServiceInput = { id: string };

@Injectable()
export class FindLandingRequestByIdService {
  constructor(private readonly repo: LandingRequestRepository) {}

  async execute(
    input: FindLandingRequestByIdServiceInput,
  ): Promise<LandingRequestResponseDTO> {
    // TODO: implementar
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new NotFoundException(`LandingRequest ${input.id} not found`);
    }
    return LandingRequestMapper.toApiRow(entity);
  }
}
