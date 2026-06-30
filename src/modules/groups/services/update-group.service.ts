import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';

import { GroupResponseDTO } from '../dtos/group-response.dto';
import { UpdateGroupDTO } from '../dtos/update-group.dto';
import { patchGroupToPrisma } from '../mappers/group.prisma.mapper';
import { GroupRepository } from '../repositories/group.repository';
import { toGroupApiRowWithImage } from '../utils/group-response';

@Injectable()
export class UpdateGroupService {
  constructor(
    private readonly repo: GroupRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    id: string,
    dto: UpdateGroupDTO,
    actor: AuthenticatedUser,
  ): Promise<GroupResponseDTO> {
    /**
     * `group:update` é ADMIN-only (`PermissionsGuard`), sem escopo por grupo —
     * a checagem de existência (404) é responsabilidade exclusiva deste service.
     */
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw resourceNotFound(
        this.errorMessageService,
        'Grupo de aeródromos',
        id,
      );
    }
    const updated = await this.repo.update(
      id,
      patchGroupToPrisma(dto, actor.id),
    );
    return toGroupApiRowWithImage(this.storage, updated);
  }
}
