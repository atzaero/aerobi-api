import { Injectable, NotFoundException } from '@nestjs/common';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { UpdateTechnicalVisitDTO } from '../dtos/update-technical-visit.dto';
import { TechnicalVisitMapper } from '../mappers/technical-visit.mapper';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';

export type UpdateTechnicalVisitServiceInput = UpdateTechnicalVisitDTO & {
  id: string;
};

@Injectable()
export class UpdateTechnicalVisitService {
  constructor(private readonly repo: TechnicalVisitRepository) {}

  async execute(
    input: UpdateTechnicalVisitServiceInput,
  ): Promise<TechnicalVisitResponseDTO> {
    // TODO: implementar
    const { id, ...data } = input;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`TechnicalVisit ${id} not found`);
    }
    const updated = await this.repo.update(id, data as never);
    return TechnicalVisitMapper.toApiRow(updated);
  }
}
