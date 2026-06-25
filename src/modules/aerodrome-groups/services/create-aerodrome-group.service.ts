import { Injectable } from '@nestjs/common';

import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { CreateAerodromeGroupDTO } from '../dtos/create-aerodrome-group.dto';
import { AerodromeGroupMapper } from '../mappers/aerodrome-group.mapper';
import { buildAerodromeGroupCreateInput } from '../mappers/aerodrome-group.prisma.mapper';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { resolveAerodromeGroupImageUrl } from '../utils/resolve-aerodrome-group-image-url';

@Injectable()
export class CreateAerodromeGroupService {
  constructor(
    private readonly repo: AerodromeGroupRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(
    dto: CreateAerodromeGroupDTO,
    actor: AuthenticatedUser,
  ): Promise<AerodromeGroupResponseDTO> {
    const created = await this.repo.create(
      buildAerodromeGroupCreateInput(dto, actor.id),
    );
    const imageUrl = await resolveAerodromeGroupImageUrl(
      this.storage,
      created.imageKey,
    );
    return AerodromeGroupMapper.toApiRow(created, imageUrl);
  }
}
