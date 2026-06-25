import { UserRole } from '@/generated/prisma/client';

/**
 * Escopo por registro (record-level) do ator sobre um recurso escopável por
 * grupo. **Distinto do gate RBAC** (`PermissionsGuard`, papel × ação): aqui
 * respondemos _quais_ registros o ator pode ver/gerir.
 *
 * Espelha `resolveGroupScope` do `aerobi-web`
 * (`app/actions/_shared/group-scope.ts`):
 *  - `all`   — sem restrição de grupo (ADMIN).
 *  - `group` — restrito ao `groupId` do ator (COORDINATOR com grupo).
 *  - `none`  — COORDINATOR sem `aerodromeGroupId` (provisionamento incompleto):
 *              não enxerga/gere nada (nunca "fail open").
 *
 * Restringe **só** COORDINATOR; ADMIN (e qualquer papel fora do conjunto) → `all`.
 * Coerente com entidades cuja matriz só inclui ADMIN/COORDINATOR (ex.: `user`,
 * `group`). Para entidades operacionais o web usa um resolver mais amplo
 * (`resolveOperationalScope`), que não se aplica aqui.
 *
 * Vive em `src/common/` por ser transversal: consumido por `users` e
 * `aerodrome-groups` (e próximos módulos da migração Firebase→API).
 */
export type UserGroupScope =
  | { kind: 'all' }
  | { kind: 'group'; groupId: string }
  | { kind: 'none' };

/**
 * Deriva o `UserGroupScope` a partir do papel + grupo do ator. O `actorGroupId`
 * deve vir de **consulta ao DB** (o JWT carrega só `role`; decisão da epic #204),
 * nunca do payload do cliente.
 */
export function resolveUserGroupScope(
  actorRole: UserRole,
  actorGroupId: string | null,
): UserGroupScope {
  if (actorRole !== UserRole.COORDINATOR) return { kind: 'all' };
  if (!actorGroupId) return { kind: 'none' };
  return { kind: 'group', groupId: actorGroupId };
}

/**
 * Resolve o `UserGroupScope` do ator buscando o grupo no DB **apenas quando
 * necessário**: ADMIN (e papéis não-restritos) curto-circuitam para `all` sem
 * consulta; só COORDINATOR dispara o `lookup` do próprio registro. Centraliza o
 * padrão usado por list/remove/resend (users) e pela list/export de grupos.
 */
export async function resolveActorGroupScope(
  actorRole: UserRole,
  actorId: string,
  lookup: (id: string) => Promise<{ aerodromeGroupId: string | null } | null>,
): Promise<UserGroupScope> {
  if (actorRole !== UserRole.COORDINATOR) return { kind: 'all' };
  const record = await lookup(actorId);
  return resolveUserGroupScope(actorRole, record?.aerodromeGroupId ?? null);
}
