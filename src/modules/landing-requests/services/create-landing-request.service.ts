import { Injectable } from '@nestjs/common';

import type { Prisma } from '@/generated/prisma/client';

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
    const data: Prisma.LandingRequestCreateInput = {
      operationalAerodrome: {
        connect: { id: dto.operationalAerodromeId },
      },
      status: dto.status,
      requestDate: dto.requestDate,
      email: dto.email,
      pilotCode: dto.pilotCode,
      aircraftModel: dto.aircraftModel,
      aircraftRegistration: dto.aircraftRegistration,
      departureAerodrome: dto.departureAerodrome,
      observation: dto.observation,
      reviewedAt: dto.reviewedAt,
      reviewedBy: dto.reviewedBy,
      createdBy: dto.createdBy,
    };

    const created = await this.repo.create(data);
    return LandingRequestMapper.toApiRow(created);
  }
}
