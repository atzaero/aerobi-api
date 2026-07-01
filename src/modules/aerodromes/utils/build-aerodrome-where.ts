import type { UserGroupScope } from '@/common/utils/group-scope.util';
import type { Prisma, Uf } from '@/generated/prisma/client';

/** Filtros comuns de listagem/exportação de aeródromos. */
export interface AerodromeFilters {
  uf?: Uf;
  search?: string;
  isOpen?: boolean;
  isView?: boolean;
  groupId?: string;
}

/**
 * Monta o `where` de aeródromos a partir dos filtros + escopo **operacional** do
 * ator (COORDINATOR/OPERATOR/TECHNICAL presos ao próprio grupo; ADMIN livre),
 * garantindo o invariante de segurança num único ponto (list e export reusam):
 *
 *  - `none`  — papel restrito sem grupo: `id: { in: [] }` **nunca casa** nada
 *              (fail-closed).
 *  - `group` — força `groupId` ao grupo do ator (ignora `filters.groupId`, que o
 *              ator não-ADMIN não pode usar para espiar outros grupos).
 *  - `all`   — ADMIN: aplica `filters.groupId` se informado.
 *
 * `search` é OR por substring case-insensitive em icao/name/municipality; `uf`
 * filtra pela relação `group.uf` (a UF é derivada do grupo, não é coluna do
 * aeródromo).
 */
export function buildAerodromeScopedWhere(
  filters: AerodromeFilters,
  scope: UserGroupScope,
): Prisma.AerodromeWhereInput {
  if (scope.kind === 'none') {
    return { id: { in: [] } };
  }

  const where: Prisma.AerodromeWhereInput = {};

  if (filters.search) {
    where.OR = [
      { icao: { contains: filters.search, mode: 'insensitive' } },
      { name: { contains: filters.search, mode: 'insensitive' } },
      { municipality: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.uf !== undefined) {
    where.group = { uf: filters.uf };
  }
  if (filters.isOpen !== undefined) {
    where.isOpen = filters.isOpen;
  }
  if (filters.isView !== undefined) {
    where.isView = filters.isView;
  }

  if (scope.kind === 'group') {
    where.groupId = scope.groupId;
  } else if (filters.groupId !== undefined) {
    where.groupId = filters.groupId;
  }

  return where;
}
