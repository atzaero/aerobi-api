import { Injectable } from '@nestjs/common';

import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';
import { CreatePilotLandingDTO } from '../dtos/create-pilot-landing.dto';
import { PilotLandingMapper } from '../mappers/pilot-landing.mapper';
import { buildPilotLandingCreateInput } from '../mappers/pilot-landing.prisma.mapper';
import { PilotLandingRepository } from '../repositories/pilot-landing.repository';

@Injectable()
export class CreatePilotLandingService {
  constructor(private readonly repo: PilotLandingRepository) {}

  async execute(dto: CreatePilotLandingDTO): Promise<PilotLandingResponseDTO> {
    const created = await this.repo.create(buildPilotLandingCreateInput(dto));
    return PilotLandingMapper.toApiRow(created);
  }
}
