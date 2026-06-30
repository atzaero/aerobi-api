import { UserRole } from '@/generated/prisma/client';

/**
 * `true` se o alvo é gerível por um ator no escopo `group` — espelha o
 * `manageable` do `aerobi-web` (`app/actions/users/delete/service.ts`):
 * COORDINATOR só toca `OPERATOR`/`TECHNICAL` do **próprio grupo**. Usado para
 * decidir entre prosseguir e responder `USER_NOT_FOUND` (sem vazar a existência
 * de alvos fora do escopo).
 *
 * Regra específica da entidade `user`; o escopo genérico por grupo
 * (`UserGroupScope`, `resolveActorGroupScope`) vive em
 * `@/common/utils/group-scope.util`.
 */
export function isTargetManageableInGroup(
  target: { role: UserRole; groupId: string | null },
  groupId: string,
): boolean {
  return (
    (target.role === UserRole.OPERATOR || target.role === UserRole.TECHNICAL) &&
    target.groupId === groupId
  );
}

/**
 * `true` se o alvo é **editável** por um COORDINATOR no escopo `group` — espelha
 * o `manageable` do `update` do `aerobi-web` (`app/actions/users/update/service.ts`),
 * que é mais amplo que o do `delete`: além de `OPERATOR`/`TECHNICAL`, inclui
 * `COORDINATOR` do **próprio grupo** (um coordinator pode editar pares do grupo).
 * `ADMIN` continua fora (coordinator nunca toca admin). Fora do escopo ⇒ tratar
 * como `USER_NOT_FOUND` (sem vazar existência).
 */
export function isTargetEditableInGroup(
  target: { role: UserRole; groupId: string | null },
  groupId: string,
): boolean {
  return (
    (target.role === UserRole.OPERATOR ||
      target.role === UserRole.TECHNICAL ||
      target.role === UserRole.COORDINATOR) &&
    target.groupId === groupId
  );
}
