import { Injectable, NotFoundException } from '@nestjs/common';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { UpdateAerodromeGroupDTO } from '../dtos/update-aerodrome-group.dto';
import { AerodromeGroupMapper } from '../mappers/aerodrome-group.mapper';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';

export type UpdateAerodromeGroupServiceInput = UpdateAerodromeGroupDTO & {
  id: string;
};

@Injectable()
export class UpdateAerodromeGroupService {
  constructor(private readonly repo: AerodromeGroupRepository) {}

  async execute(
    input: UpdateAerodromeGroupServiceInput,
  ): Promise<AerodromeGroupResponseDTO> {
    // TODO: implementar
    const { id, ...data } = input;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`AerodromeGroup ${id} not found`);
    }
    const updated = await this.repo.update(id, data as never);
    return AerodromeGroupMapper.toApiRow(updated);
  }
}
