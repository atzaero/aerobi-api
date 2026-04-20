import { Injectable } from '@nestjs/common';

import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';
import { CreatePilotLandingDTO } from '../dtos/create-pilot-landing.dto';
import { PilotLandingMapper } from '../mappers/pilot-landing.mapper';
import { PilotLandingRepository } from '../repositories/pilot-landing.repository';

@Injectable()
export class CreatePilotLandingService {
  constructor(private readonly repo: PilotLandingRepository) {}

  async execute(dto: CreatePilotLandingDTO): Promise<PilotLandingResponseDTO> {
    // TODO: implementar
    const created = await this.repo.create(dto as never);
    return PilotLandingMapper.toApiRow(created);
  }
}
