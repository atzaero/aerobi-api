import { Injectable } from '@nestjs/common';

import type { Prisma } from '@/generated/prisma/client';

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
    const data: Prisma.AerodromeGroupCreateInput = {
      uf: dto.uf,
      groupName: dto.groupName,
      ownerId: dto.ownerId,
      deletionRequested: dto.deletionRequested,
      createdBy: dto.createdBy,
    };

    const created = await this.repo.create(data);
    return AerodromeGroupMapper.toApiRow(created);
  }
}
