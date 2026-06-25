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
  target: { role: UserRole; aerodromeGroupId: string | null },
  groupId: string,
): boolean {
  return (
    (target.role === UserRole.OPERATOR || target.role === UserRole.TECHNICAL) &&
    target.aerodromeGroupId === groupId
  );
}
