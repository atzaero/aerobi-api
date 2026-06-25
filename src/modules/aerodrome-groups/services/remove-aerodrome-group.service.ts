import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';

import { AerodromeGroupDeletionResponseDTO } from '../dtos/aerodrome-group-deletion-response.dto';
import { AerodromeGroupMapper } from '../mappers/aerodrome-group.mapper';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { resolveAerodromeGroupImageUrl } from '../utils/resolve-aerodrome-group-image-url';

@Injectable()
export class RemoveAerodromeGroupService {
  constructor(
    private readonly repo: AerodromeGroupRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<AerodromeGroupDeletionResponseDTO> {
    /**
     * Existência checada aqui porque o `GroupScopeGuard` faz bypass para ADMIN
     * (COORDINATOR nem chega: o `PermissionsGuard` barra — `group:delete` é só
     * ADMIN).
     */
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Grupo de aeródromos',
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    const { group, affectedAerodromes } = await this.repo.softDeleteWithCascade(
      id,
      actor.id,
    );

    const imageUrl = await resolveAerodromeGroupImageUrl(
      this.storage,
      group.imageKey,
    );

    return AerodromeGroupMapper.toDeletionResult(
      group,
      affectedAerodromes,
      imageUrl,
    );
  }
}
