import type { UserGroupScope } from '@/common/utils/group-scope.util';
import type { Prisma, Uf } from '@/generated/prisma/client';

/** Filtros comuns de listagem/exportação de grupos. */
export interface AerodromeGroupFilters {
  uf?: Uf;
  name?: string;
}

/**
 * Monta o `where` de grupos a partir dos filtros + escopo do ator, garantindo o
 * invariante de segurança num **único ponto** (list e export reusam isto):
 *
 *  - `none`  — COORDINATOR sem grupo: `id: { in: [] }` **nunca casa** registro
 *              algum (fail-closed). Centralizar aqui evita o "fail open" de um
 *              consumidor futuro esquecer o ramo `none`.
 *  - `group` — força `id` ao próprio grupo do COORDINATOR.
 *  - `all`   — ADMIN: sem restrição de grupo.
 *
 * `uf`/`name` são aplicados em qualquer escopo não-`none` (`name` por substring
 * case-insensitive).
 */
export function buildAerodromeGroupScopedWhere(
  filters: AerodromeGroupFilters,
  scope: UserGroupScope,
): Prisma.AerodromeGroupWhereInput {
  if (scope.kind === 'none') {
    return { id: { in: [] } };
  }

  const where: Prisma.AerodromeGroupWhereInput = {};
  if (filters.uf !== undefined) {
    where.uf = filters.uf;
  }
  if (filters.name !== undefined) {
    where.name = { contains: filters.name, mode: 'insensitive' };
  }
  if (scope.kind === 'group') {
    where.id = scope.groupId;
  }
  return where;
}
