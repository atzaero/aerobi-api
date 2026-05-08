import { Injectable } from '@nestjs/common';

import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { CreateLandingRequestDTO } from '../dtos/create-landing-request.dto';
import { LandingRequestMapper } from '../mappers/landing-request.mapper';
import { buildLandingRequestCreateInput } from '../mappers/landing-request.prisma.mapper';
import { LandingRequestRepository } from '../repositories/landing-request.repository';

@Injectable()
export class CreateLandingRequestService {
  constructor(private readonly repo: LandingRequestRepository) {}

  async execute(
    dto: CreateLandingRequestDTO,
  ): Promise<LandingRequestResponseDTO> {
    const created = await this.repo.create(buildLandingRequestCreateInput(dto));
    return LandingRequestMapper.toApiRow(created);
  }
}
