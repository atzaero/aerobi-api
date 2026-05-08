import { Injectable } from '@nestjs/common';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { CreateTechnicalVisitDTO } from '../dtos/create-technical-visit.dto';
import { TechnicalVisitMapper } from '../mappers/technical-visit.mapper';
import { buildTechnicalVisitCreateInput } from '../mappers/technical-visit.prisma.mapper';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';

@Injectable()
export class CreateTechnicalVisitService {
  constructor(private readonly repo: TechnicalVisitRepository) {}

  async execute(
    dto: CreateTechnicalVisitDTO,
  ): Promise<TechnicalVisitResponseDTO> {
    const created = await this.repo.create(buildTechnicalVisitCreateInput(dto));
    return TechnicalVisitMapper.toApiRow(created);
  }
}
