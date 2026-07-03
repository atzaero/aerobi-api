import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { CameraResponseDTO } from '../dtos/camera-response.dto';
import { CreateCameraDTO } from '../dtos/create-camera.dto';
import { CameraMapper } from '../mappers/camera.mapper';
import { buildCameraCreateInput } from '../mappers/camera.prisma.mapper';
import { CameraRepository } from '../repositories/camera.repository';
import type { StreamIdentity } from '../repositories/camera.repository.interface';

import {
  assertStreamUnique,
  rethrowCameraStreamConflict,
} from './camera-write.helpers';

/**
 * Cria uma câmera. Deriva o `icao` do aeródromo de destino (mantém o campo
 * desnormalizado em sincronia), aplica o escopo de grupo do ator (COORDINATOR só
 * no próprio grupo; ADMIN em qualquer), garante a unicidade do stream entre
 * câmeras ativas e audita `createdBy` com o ator real.
 */
@Injectable()
export class CreateCameraService {
  constructor(
    private readonly repo: CameraRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    dto: CreateCameraDTO,
    actor: AuthenticatedUser,
  ): Promise<CameraResponseDTO> {
    const aerodrome = await this.repo.findActiveAerodrome(dto.aerodromeId);

    /**
     * Escopo de criação (o recurso ainda não existe → não passa pelo
     * `GroupScopeGuard` de `:id`): COORDINATOR só cria no próprio grupo; ADMIN em
     * qualquer. Existência (404) e escopo são resolvidos num **único ponto** para
     * NÃO vazar a existência de aeródromos fora do grupo: para o COORDINATOR,
     * "aeródromo inexistente" e "de outro grupo" respondem igual (404) — mesma
     * filosofia de 404 uniforme do `GroupScopeGuard` (#387). COORDINATOR sem grupo
     * (`none`) não cria em lugar nenhum.
     */
    const scope = await resolveActorGroupScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );
    const outOfScope =
      scope.kind === 'none' ||
      (scope.kind === 'group' && aerodrome?.groupId !== scope.groupId);
    if (!aerodrome || outOfScope) {
      throw resourceNotFound(
        this.errorMessageService,
        'Aeródromo',
        dto.aerodromeId,
      );
    }

    /** `icao` derivado do aeródromo (fonte de verdade), normalizado. */
    const icao = aerodrome.icao.trim().toUpperCase();
    const identity: StreamIdentity = {
      icao,
      mediamtxNode: dto.mediamtxNode,
      mediamtxPath: dto.mediamtxPath,
    };
    await assertStreamUnique(this.repo, this.errorMessageService, identity);

    try {
      const created = await this.repo.create(
        buildCameraCreateInput({
          aerodromeId: dto.aerodromeId,
          icao,
          name: dto.name,
          mediamtxNode: dto.mediamtxNode,
          mediamtxPath: dto.mediamtxPath,
          enabled: dto.enabled ?? true,
          createdBy: actor.id,
        }),
      );
      return CameraMapper.toApiRow(created);
    } catch (err) {
      rethrowCameraStreamConflict(err, this.errorMessageService, identity);
    }
  }
}
