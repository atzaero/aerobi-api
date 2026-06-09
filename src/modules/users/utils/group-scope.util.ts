import { UserRole } from '@/generated/prisma/client';

/**
 * Escopo por registro (record-level) do ator sobre a entidade `user`.
 * **Distinto do gate RBAC** (`PermissionsGuard`, papel × ação): aqui
 * respondemos _quais_ usuários o ator pode ver/gerir.
 *
 * Espelha `resolveGroupScope` do `aerobi-web`
 * (`app/actions/_shared/group-scope.ts`):
 *  - `all`   — sem restrição de grupo (ADMIN).
 *  - `group` — restrito ao `groupId` do ator (COORDINATOR com grupo).
 *  - `none`  — COORDINATOR sem `aerodromeGroupId` (provisionamento incompleto):
 *              não enxerga/gere nada (nunca "fail open").
 *
 * Restringe **só** COORDINATOR; ADMIN (e qualquer papel fora do conjunto) → `all`.
 * Isto é o resolver coerente com a entidade `user` (cuja matriz só inclui
 * ADMIN/COORDINATOR). Para entidades operacionais o web usa um resolver mais
 * amplo (`resolveOperationalScope`), que não se aplica aqui.
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
 * padrão usado por list/remove/resend.
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

/**
 * `true` se o alvo é gerível por um ator no escopo `group` — espelha o
 * `manageable` do `aerobi-web` (`app/actions/users/delete/service.ts`):
 * COORDINATOR só toca `OPERATOR`/`TECHNICAL` do **próprio grupo**. Usado para
 * decidir entre prosseguir e responder `USER_NOT_FOUND` (sem vazar a existência
 * de alvos fora do escopo).
 */
export function isTargetManageableInGroup(
  target: { role: UserRole; aerodromeGroupId: string | null },
  groupId: string,
): boolean {
  return (
    (target.role === UserRole.OPERATOR || target.role === UserRole.TECHNICAL) &&
    target.aerodromeGroupId === groupId
  );
}
