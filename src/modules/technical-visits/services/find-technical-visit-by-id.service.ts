import { Injectable, NotFoundException } from '@nestjs/common';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { TechnicalVisitMapper } from '../mappers/technical-visit.mapper';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';

export type FindTechnicalVisitByIdServiceInput = { id: string };

@Injectable()
export class FindTechnicalVisitByIdService {
  constructor(private readonly repo: TechnicalVisitRepository) {}

  async execute(
    input: FindTechnicalVisitByIdServiceInput,
  ): Promise<TechnicalVisitResponseDTO> {
    // TODO: implementar
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new NotFoundException(`TechnicalVisit ${input.id} not found`);
    }
    return TechnicalVisitMapper.toApiRow(entity);
  }
}
