import type { ErrorMessageService } from '@/common/error-messages/error-message.service';
import type { UserGroupScope } from '@/common/utils/group-scope.util';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';

import type { AerodromeScopeRef } from '../repositories/technical-visit.repository.interface';

/**
 * Garante que o aeródromo existe e pertence ao escopo operacional do ator.
 * Predicado puro — o carregamento do aeródromo fica no repositório. Inexistente/
 * soft-deletado ou fora do escopo ⇒ 404 (não vaza existência), espelhando
 * `assertAerodromeOperationalAccess` do web. ADMIN (`scope.all`) passa direto.
 */
export function assertAerodromeOperationalScope(
  aerodrome: AerodromeScopeRef | null,
  scope: UserGroupScope,
  errorMessageService: ErrorMessageService,
  aerodromeId: string,
): void {
  if (
    !aerodrome ||
    scope.kind === 'none' ||
    (scope.kind === 'group' && aerodrome.groupId !== scope.groupId)
  ) {
    throw resourceNotFound(errorMessageService, 'Aeródromo', aerodromeId);
  }
}
