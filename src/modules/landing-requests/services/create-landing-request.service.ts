import { Injectable } from '@nestjs/common';

import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { CreateLandingRequestDTO } from '../dtos/create-landing-request.dto';
import { LandingRequestMapper } from '../mappers/landing-request.mapper';
import { LandingRequestRepository } from '../repositories/landing-request.repository';

@Injectable()
export class CreateLandingRequestService {
  constructor(private readonly repo: LandingRequestRepository) {}

  async execute(
    dto: CreateLandingRequestDTO,
  ): Promise<LandingRequestResponseDTO> {
    // TODO: implementar
    const created = await this.repo.create(dto as never);
    return LandingRequestMapper.toApiRow(created);
  }
}
