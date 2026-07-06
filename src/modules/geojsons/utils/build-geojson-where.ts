import type { UserGroupScope } from '@/common/utils/group-scope.util';
import type { Prisma } from '@/generated/prisma/client';

import type { ListGeojsonsQueryDTO } from '../dtos/list-geojsons-query.dto';

/**
 * Monta o `where` da listagem de GeoJSONs a partir dos filtros + escopo
 * operacional do ator, garantindo o invariante de segurança num único ponto:
 *
 *  - `none`  — papel restrito sem grupo: `id: { in: [] }` **nunca casa** nada
 *              (fail-closed).
 *  - `group` — restringe via relação (`aerodrome: { groupId }`), pois o GeoJSON
 *              não tem `groupId` próprio — deriva do aeródromo dono.
 *  - `all`   — ADMIN: sem restrição de grupo.
 *
 * `aerodromeId`/`status` por igualdade. O `deletedAt: null` (soft-delete) é
 * aplicado no repositório, não aqui.
 */
export function buildGeojsonScopedWhere(
  filters: ListGeojsonsQueryDTO,
  scope: UserGroupScope,
): Prisma.GeojsonWhereInput {
  if (scope.kind === 'none') {
    return { id: { in: [] } };
  }

  const where: Prisma.GeojsonWhereInput = {};

  if (filters.aerodromeId !== undefined) {
    where.aerodromeId = filters.aerodromeId;
  }
  if (filters.status !== undefined) {
    where.status = filters.status;
  }
  if (scope.kind === 'group') {
    where.aerodrome = { groupId: scope.groupId };
  }

  return where;
}
