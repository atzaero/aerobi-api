import { Injectable } from '@nestjs/common';

import type { Prisma } from '@/generated/prisma/client';

import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';
import { CreatePilotLandingDTO } from '../dtos/create-pilot-landing.dto';
import { PilotLandingMapper } from '../mappers/pilot-landing.mapper';
import { PilotLandingRepository } from '../repositories/pilot-landing.repository';

@Injectable()
export class CreatePilotLandingService {
  constructor(private readonly repo: PilotLandingRepository) {}

  async execute(dto: CreatePilotLandingDTO): Promise<PilotLandingResponseDTO> {
    const data: Prisma.PilotLandingCreateInput = {
      registration: dto.registration,
      localName: dto.localName,
      localIcao: dto.localIcao,
      checked: dto.checked,
      imagesPath: dto.imagesPath,
      landingAt: dto.landingAt,
      createdBy: dto.createdBy ?? undefined,
    };
    if (dto.operationalAerodromeId) {
      data.operationalAerodrome = {
        connect: { id: dto.operationalAerodromeId },
      };
    }

    const created = await this.repo.create(data);
    return PilotLandingMapper.toApiRow(created);
  }
}
