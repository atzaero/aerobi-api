import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { AerodromeGroupMapper } from '../mappers/aerodrome-group.mapper';
import { AerodromeGroupImageRepository } from '../repositories/aerodrome-group-image.repository';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { resolveAerodromeGroupImageUrl } from '../utils/resolve-aerodrome-group-image-url';

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
      throw this.notFound(groupId, 'Grupo de aeródromos');
    }

    /**
     * Soft-delete da ativa + ressincroniza `imageKey` na transação. Não apaga o
     * objeto no MinIO (cleanup físico de órfãos é follow-up, como no web).
     */
    const removed = await this.imageRepo.removeActiveImage(groupId, actor.id);
    if (!removed) {
      throw this.notFound(groupId, 'Imagem do grupo');
    }

    const updated = (await this.groupRepo.findById(groupId)) ?? group;
    const imageUrl = await resolveAerodromeGroupImageUrl(
      this.storage,
      updated.imageKey,
    );
    return AerodromeGroupMapper.toApiRow(updated, imageUrl);
  }

  private notFound(id: string, resource: string): CustomHttpException {
    return new CustomHttpException(
      this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
        RESOURCE: resource,
        ID: id,
      }),
      HttpStatus.NOT_FOUND,
      ErrorCode.RESOURCE_NOT_FOUND,
    );
  }
}
