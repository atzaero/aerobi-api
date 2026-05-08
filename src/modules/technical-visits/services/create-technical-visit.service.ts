import { Injectable } from '@nestjs/common';

import type { Prisma } from '@/generated/prisma/client';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { CreateTechnicalVisitDTO } from '../dtos/create-technical-visit.dto';
import { TechnicalVisitMapper } from '../mappers/technical-visit.mapper';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';

@Injectable()
export class CreateTechnicalVisitService {
  constructor(private readonly repo: TechnicalVisitRepository) {}

  async execute(
    dto: CreateTechnicalVisitDTO,
  ): Promise<TechnicalVisitResponseDTO> {
    const { operationalAerodromeId, ...rest } = dto;
    const data = {
      ...rest,
      operationalAerodrome: {
        connect: { id: operationalAerodromeId },
      },
    } satisfies Prisma.TechnicalVisitCreateInput;

    const created = await this.repo.create(data);
    return TechnicalVisitMapper.toApiRow(created);
  }
}
