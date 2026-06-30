import { Injectable } from '@nestjs/common';

import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';

import { GroupResponseDTO } from '../dtos/group-response.dto';
import { CreateGroupDTO } from '../dtos/create-group.dto';
import { buildGroupCreateInput } from '../mappers/group.prisma.mapper';
import { GroupRepository } from '../repositories/group.repository';
import { toGroupApiRowWithImage } from '../utils/group-response';

@Injectable()
export class CreateGroupService {
  constructor(
    private readonly repo: GroupRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(
    dto: CreateGroupDTO,
    actor: AuthenticatedUser,
  ): Promise<GroupResponseDTO> {
    const created = await this.repo.create(
      buildGroupCreateInput(dto, actor.id),
    );
    return toGroupApiRowWithImage(this.storage, created);
  }
}
