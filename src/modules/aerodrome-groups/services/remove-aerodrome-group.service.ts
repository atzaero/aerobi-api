import { Injectable, NotFoundException } from '@nestjs/common';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { AerodromeGroupMapper } from '../mappers/aerodrome-group.mapper';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';

export type RemoveAerodromeGroupServiceInput = {
  id: string;
  deletedBy: string;
};

@Injectable()
export class RemoveAerodromeGroupService {
  constructor(private readonly repo: AerodromeGroupRepository) {}

  async execute(
    input: RemoveAerodromeGroupServiceInput,
  ): Promise<AerodromeGroupResponseDTO> {
    // TODO: implementar (soft delete)
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new NotFoundException(`AerodromeGroup ${input.id} not found`);
    }
    const deleted = await this.repo.softDelete(input.id, input.deletedBy);
    return AerodromeGroupMapper.toApiRow(deleted);
  }
}
