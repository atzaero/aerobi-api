import { Injectable, NotFoundException } from '@nestjs/common';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { AerodromeGroupMapper } from '../mappers/aerodrome-group.mapper';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';

export type FindAerodromeGroupByIdServiceInput = { id: string };

@Injectable()
export class FindAerodromeGroupByIdService {
  constructor(private readonly repo: AerodromeGroupRepository) {}

  async execute(
    input: FindAerodromeGroupByIdServiceInput,
  ): Promise<AerodromeGroupResponseDTO> {
    // TODO: implementar
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new NotFoundException(`AerodromeGroup ${input.id} not found`);
    }
    return AerodromeGroupMapper.toApiRow(entity);
  }
}
