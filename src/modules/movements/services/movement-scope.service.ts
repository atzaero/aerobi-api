import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { AerodromeRepository } from '@/modules/aerodromes/repositories/aerodrome.repository';
import { UserRepository } from '@/modules/users/repositories/user.repository';

/**
 * Escopo por registro dos movimentos. Como `Movement.aerodrome` é o **ICAO**
 * (string, nullable) e **não** uma FK a `aerodromes`, o `GroupScopeGuard` (que
 * resolve o grupo por FK a partir de `params.id`) não se aplica — o escopo é
 * materializado aqui pelo **conjunto de ICAOs** dos aeródromos do grupo do ator.
 *
 * Espelha a matriz do `movement` (admin/coordinator): só COORDINATOR é restrito
 * ao próprio grupo (`resolveActorGroupScope`); ADMIN vê tudo. Movimentos com
 * `aerodrome = null` (sem ICAO) só são visíveis a ADMIN. Fonte: issue #559.
 */
@Injectable()
export class MovementScopeService {
  constructor(
    private readonly aerodromeRepo: AerodromeRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  /**
   * ICAOs visíveis ao ator: `null` = sem restrição (ADMIN); `[]` = fail-closed
   * (COORDINATOR sem grupo provisionado — vê página vazia, nunca "fail open").
   */
  async resolveScopedIcaos(actor: AuthenticatedUser): Promise<string[] | null> {
    const scope = await resolveActorGroupScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );
    if (scope.kind === 'all') return null;
    if (scope.kind === 'none') return [];
    return this.aerodromeRepo.findActiveIcaosByGroup(scope.groupId);
  }

  /**
   * Garante que o movimento (pelo seu ICAO) está no escopo do ator — 404 uniforme
   * caso contrário (não vaza existência de recurso de outro grupo). ADMIN passa
   * direto; movimento sem ICAO (`aerodrome = null`) só é acessível a ADMIN.
   */
  async assertMovementInScope(
    movement: { aerodrome: string | null },
    movementId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    const icaos = await this.resolveScopedIcaos(actor);
    if (icaos === null) return;
    if (movement.aerodrome !== null && icaos.includes(movement.aerodrome)) {
      return;
    }
    throw resourceNotFound(this.errorMessageService, 'Movimento', movementId);
  }

  /**
   * Garante que o ICAO informado (criação manual) está no escopo do ator — 404
   * caso contrário. ADMIN cria para qualquer aeródromo; COORDINATOR só para os
   * aeródromos do próprio grupo.
   */
  async assertIcaoInScope(
    icao: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    const icaos = await this.resolveScopedIcaos(actor);
    if (icaos === null) return;
    if (icaos.includes(icao)) return;
    throw resourceNotFound(this.errorMessageService, 'Aeródromo', icao);
  }
}
