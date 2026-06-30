import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';

import { GroupDeletionResponseDTO } from '../dtos/group-deletion-response.dto';
import { GroupRepository } from '../repositories/group.repository';
import { toGroupDeletionResultWithImage } from '../utils/group-response';

@Injectable()
export class RemoveGroupService {
  constructor(
    private readonly repo: GroupRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<GroupDeletionResponseDTO> {
    /**
     * `group:delete` é ADMIN-only (`PermissionsGuard`), sem escopo por grupo — a
     * checagem de existência (404) é responsabilidade exclusiva deste service.
     */
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw resourceNotFound(
        this.errorMessageService,
        'Grupo de aeródromos',
        id,
      );
    }
    const { group, affectedAerodromes } = await this.repo.softDeleteWithCascade(
      id,
      actor.id,
    );

    return toGroupDeletionResultWithImage(
      this.storage,
      group,
      affectedAerodromes,
    );
  }
}
