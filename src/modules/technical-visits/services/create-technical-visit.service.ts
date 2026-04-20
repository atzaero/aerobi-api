import { Injectable } from '@nestjs/common';

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
    // TODO: implementar
    const created = await this.repo.create(dto as never);
    return TechnicalVisitMapper.toApiRow(created);
  }
}
