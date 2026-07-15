import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { CameraResponseDTO } from '../dtos/camera-response.dto';
import { UpdateCameraDTO } from '../dtos/update-camera.dto';
import { CameraMapper } from '../mappers/camera.mapper';
import { patchCameraToPrisma } from '../mappers/camera.prisma.mapper';
import { CameraRepository } from '../repositories/camera.repository';
import type { StreamIdentity } from '../repositories/camera.repository.interface';

import { CameraQueryService } from './camera-query.service';
import {
  assertStreamUnique,
  rethrowCameraStreamConflict,
} from './camera-write.helpers';

/**
 * Atualiza uma câmera (PATCH parcial). O `GroupScopeGuard` já garantiu que o
 * recurso pertence ao grupo do ator (ADMIN faz bypass); aqui ficam a existência
 * (404), a unicidade do stream (só revalidada quando `node`/`path` mudam) e a
 * auditoria (`updatedBy`).
 */
@Injectable()
export class UpdateCameraService {
  constructor(
    private readonly repo: CameraRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly cameraQuery: CameraQueryService,
  ) {}

  async execute(
    id: string,
    dto: UpdateCameraDTO,
    actor: AuthenticatedUser,
  ): Promise<CameraResponseDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw resourceNotFound(this.errorMessageService, 'Câmera', id);
    }

    /**
     * O `icao` é imutável pelo CRUD (a câmera não troca de aeródromo), então a
     * unicidade usa o `icao` do registro + o `node`/`path` resultantes.
     */
    const identity: StreamIdentity = {
      icao: existing.icao,
      mediamtxNode: dto.mediamtxNode ?? existing.mediamtxNode,
      mediamtxPath: dto.mediamtxPath ?? existing.mediamtxPath,
      exceptId: id,
    };
    if (dto.mediamtxNode !== undefined || dto.mediamtxPath !== undefined) {
      await assertStreamUnique(this.repo, this.errorMessageService, identity);
    }

    try {
      const updated = await this.repo.update(
        id,
        patchCameraToPrisma(dto, actor.id),
      );
      /**
       * Reflete a mudança no proxy imediatamente (enabled/node/path podem ter
       * mudado); sem isto, o TTL positivo seguraria o estado antigo por até 60s.
       */
      this.cameraQuery.invalidate(id);
      return CameraMapper.toApiRow(updated);
    } catch (err) {
      rethrowCameraStreamConflict(err, this.errorMessageService, identity);
    }
  }
}
