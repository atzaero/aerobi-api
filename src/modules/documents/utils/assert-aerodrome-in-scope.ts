import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import type { UserGroupScope } from '@/common/utils/group-scope.util';

import type { AerodromeScopeRef } from '../repositories/document.repository.interface';

/**
 * Garante o acesso ao aeródromo de destino no `create`/`upload-aerodrome-file`
 * (o escopo por grupo não pode ser resolvido pelo `GroupScopeGuard`, pois o
 * `aerodromeId` vem no corpo, não em `:id`). Espelha `assertAerodromeAccess` do
 * web: inexistente/soft-deletado ou fora do grupo do ator ⇒ **404** (não vaza
 * existência). ADMIN (`scope.all`) passa direto. Devolve o aeródromo (com `uf`)
 * para derivar o `uf` do documento.
 */
export function assertAerodromeInScope(
  aerodrome: AerodromeScopeRef | null,
  scope: UserGroupScope,
  errorMessageService: ErrorMessageService,
  aerodromeId: string,
): AerodromeScopeRef {
  if (
    !aerodrome ||
    scope.kind === 'none' ||
    (scope.kind === 'group' && aerodrome.groupId !== scope.groupId)
  ) {
    throw resourceNotFound(errorMessageService, 'Aeródromo', aerodromeId);
  }
  return aerodrome;
}
