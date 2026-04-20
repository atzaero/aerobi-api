import { Injectable } from '@nestjs/common';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { CreateAerodromeGroupDTO } from '../dtos/create-aerodrome-group.dto';
import { AerodromeGroupMapper } from '../mappers/aerodrome-group.mapper';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';

@Injectable()
export class CreateAerodromeGroupService {
  constructor(private readonly repo: AerodromeGroupRepository) {}

  async execute(
    dto: CreateAerodromeGroupDTO,
  ): Promise<AerodromeGroupResponseDTO> {
    // TODO: implementar
    const created = await this.repo.create(dto as never);
    return AerodromeGroupMapper.toApiRow(created);
  }
}
