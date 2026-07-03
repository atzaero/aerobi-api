import type { UserGroupScope } from '@/common/utils/group-scope.util';
import type { Prisma } from '@/generated/prisma/client';

/** Filtros de listagem de câmeras. */
export interface CameraFilters {
  icao?: string;
  name?: string;
}

/**
 * Monta o `where` de câmeras a partir dos filtros + escopo de grupo do ator,
 * garantindo o invariante de segurança num único ponto:
 *
 *  - `none`  — COORDINATOR sem grupo: `id: { in: [] }` **nunca casa** nada
 *              (fail-closed).
 *  - `group` — restringe via relação (`aerodrome: { groupId }`), pois a câmera
 *              não tem `groupId` próprio — deriva do aeródromo dono.
 *  - `all`   — ADMIN: sem restrição de grupo.
 *
 * `icao` casa por igualdade case-insensitive; `name` por substring
 * case-insensitive. O `deletedAt: null` (soft-delete) é aplicado no repositório.
 */
export function buildCameraScopedWhere(
  filters: CameraFilters,
  scope: UserGroupScope,
): Prisma.CameraWhereInput {
  if (scope.kind === 'none') {
    return { id: { in: [] } };
  }

  const where: Prisma.CameraWhereInput = {};

  if (filters.icao !== undefined) {
    where.icao = { equals: filters.icao, mode: 'insensitive' };
  }
  if (filters.name !== undefined) {
    where.name = { contains: filters.name, mode: 'insensitive' };
  }

  if (scope.kind === 'group') {
    where.aerodrome = { groupId: scope.groupId };
  }

  return where;
}
