import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';

import { GroupResponseDTO } from '../dtos/group-response.dto';
import { GroupImageRepository } from '../repositories/group-image.repository';
import { GroupRepository } from '../repositories/group.repository';
import { toGroupApiRowWithImage } from '../utils/group-response';

@Injectable()
export class RemoveGroupImageService {
  constructor(
    private readonly groupRepo: GroupRepository,
    private readonly imageRepo: GroupImageRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    groupId: string,
    actor: AuthenticatedUser,
  ): Promise<GroupResponseDTO> {
    /** `group:update` é ADMIN-only (`PermissionsGuard`): a existência (404) é checada aqui. */
    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      throw resourceNotFound(
        this.errorMessageService,
        'Grupo de aeródromos',
        groupId,
      );
    }

    /**
     * Soft-delete da ativa + ressincroniza `imageKey` na transação. Não apaga o
     * objeto no MinIO (cleanup físico de órfãos é follow-up, como no web).
     * Retorna o grupo já atualizado, ou `null` se não havia imagem ativa.
     */
    const updated = await this.imageRepo.removeActiveImage(groupId, actor.id);
    if (updated === null) {
      throw resourceNotFound(
        this.errorMessageService,
        'Imagem do grupo',
        groupId,
      );
    }

    return toGroupApiRowWithImage(this.storage, updated);
  }
}
