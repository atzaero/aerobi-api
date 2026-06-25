import { Injectable } from '@nestjs/common';

import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { CreateAerodromeGroupDTO } from '../dtos/create-aerodrome-group.dto';
import { AerodromeGroupMapper } from '../mappers/aerodrome-group.mapper';
import { buildAerodromeGroupCreateInput } from '../mappers/aerodrome-group.prisma.mapper';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';

@Injectable()
export class CreateAerodromeGroupService {
  constructor(private readonly repo: AerodromeGroupRepository) {}

  async execute(
    dto: CreateAerodromeGroupDTO,
    actor: AuthenticatedUser,
  ): Promise<AerodromeGroupResponseDTO> {
    const created = await this.repo.create(
      buildAerodromeGroupCreateInput(dto, actor.id),
    );
    return AerodromeGroupMapper.toApiRow(created);
  }
}
