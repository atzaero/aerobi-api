import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { UpdateAerodromeGroupDTO } from '../dtos/update-aerodrome-group.dto';
import { patchAerodromeGroupToPrisma } from '../mappers/aerodrome-group.prisma.mapper';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { toAerodromeGroupApiRowWithImage } from '../utils/aerodrome-group-response';

@Injectable()
export class UpdateAerodromeGroupService {
  constructor(
    private readonly repo: AerodromeGroupRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    id: string,
    dto: UpdateAerodromeGroupDTO,
    actor: AuthenticatedUser,
  ): Promise<AerodromeGroupResponseDTO> {
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
      patchAerodromeGroupToPrisma(dto, actor.id),
    );
    return toAerodromeGroupApiRowWithImage(this.storage, updated);
  }
}
