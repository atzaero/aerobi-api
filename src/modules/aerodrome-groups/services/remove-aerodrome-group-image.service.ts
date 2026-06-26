import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { AerodromeGroupImageRepository } from '../repositories/aerodrome-group-image.repository';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { toAerodromeGroupApiRowWithImage } from '../utils/aerodrome-group-response';

@Injectable()
export class RemoveAerodromeGroupImageService {
  constructor(
    private readonly groupRepo: AerodromeGroupRepository,
    private readonly imageRepo: AerodromeGroupImageRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    groupId: string,
    actor: AuthenticatedUser,
  ): Promise<AerodromeGroupResponseDTO> {
    /** Existência checada aqui — o `GroupScopeGuard` faz bypass para ADMIN. */
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

    return toAerodromeGroupApiRowWithImage(this.storage, updated);
  }
}
