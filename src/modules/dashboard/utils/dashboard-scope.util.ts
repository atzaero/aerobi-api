import type { ErrorMessageService } from '@/common/error-messages/error-message.service';
import {
  resolveOperationalActorScope,
  type ActorGroupLookup,
} from '@/common/utils/group-scope.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { DashboardScopeKind } from '../dtos/dashboard-response.dto';

/** Porta mínima para materializar os aeródromos ativos de um grupo. */
export interface DashboardAerodromeScopeSource {
  findActiveIdsByGroup(groupId: string): Promise<string[]>;
}

/**
 * Escopo do dashboard já materializado em ids de aeródromo. `aerodromeIds`:
 * `null` = escopo `all` (sem filtro nos repos); array (inclusive `[]`) =
 * `aerodromeId in [...]` — `[]` zera os agregados (paridade com `none`, sem
 * fail-open). Convenção idêntica à de `findTasksForStats`.
 */
export interface DashboardScope {
  scopeKind: DashboardScopeKind;
  aerodromeIds: string[] | null;
}

/**
 * Resolve o escopo operacional do ator (ADMIN=all; COORDINATOR/OPERATOR/TECHNICAL
 * =grupo; sem grupo=none) e o materializa em ids de aeródromo para as agregações.
 * Espelha `resolveScopedAerodromeIds` do `aerobi-web`.
 */
export async function resolveDashboardAerodromeScope(
  actor: AuthenticatedUser,
  actorLookup: ActorGroupLookup,
  aerodromeSource: DashboardAerodromeScopeSource,
  errorMessageService: ErrorMessageService,
): Promise<DashboardScope> {
  const scope = await resolveOperationalActorScope(
    actor.role,
    actor.id,
    actorLookup,
    errorMessageService,
  );

  if (scope.kind === 'all') return { scopeKind: 'all', aerodromeIds: null };
  if (scope.kind === 'none') return { scopeKind: 'none', aerodromeIds: [] };

  const aerodromeIds = await aerodromeSource.findActiveIdsByGroup(
    scope.groupId,
  );
  return { scopeKind: 'group', aerodromeIds };
}
