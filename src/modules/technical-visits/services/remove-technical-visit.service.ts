import { Injectable, NotFoundException } from '@nestjs/common';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { TechnicalVisitMapper } from '../mappers/technical-visit.mapper';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';

export type RemoveTechnicalVisitServiceInput = {
  id: string;
  deletedBy: string;
};

@Injectable()
export class RemoveTechnicalVisitService {
  constructor(private readonly repo: TechnicalVisitRepository) {}

  async execute(
    input: RemoveTechnicalVisitServiceInput,
  ): Promise<TechnicalVisitResponseDTO> {
    // TODO: implementar (soft delete)
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new NotFoundException(`TechnicalVisit ${input.id} not found`);
    }
    const deleted = await this.repo.softDelete(input.id, input.deletedBy);
    return TechnicalVisitMapper.toApiRow(deleted);
  }
}
