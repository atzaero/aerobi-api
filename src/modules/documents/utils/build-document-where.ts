import type { UserGroupScope } from '@/common/utils/group-scope.util';
import type { DocumentType, Prisma } from '@/generated/prisma/client';

/** Filtros já normalizados (type como enum) para montar o `where`. */
export interface DocumentWhereFilters {
  aerodromeId?: string;
  type?: DocumentType;
  search?: string;
}

/**
 * Monta o `where` de documentos a partir dos filtros + escopo operacional do
 * ator (fail-closed):
 *
 *  - `none`  → `id: { in: [] }` (nunca casa);
 *  - `group` → restringe via relação `aerodrome: { groupId }` (o documento não
 *              tem `groupId` próprio);
 *  - `all`   → sem restrição de grupo.
 *
 * `aerodromeId`/`type` por igualdade; `search` por substring case-insensitive em
 * `originalFilename`. O `deletedAt: null` é aplicado no repositório.
 */
export function buildDocumentScopedWhere(
  filters: DocumentWhereFilters,
  scope: UserGroupScope,
): Prisma.DocumentWhereInput {
  if (scope.kind === 'none') {
    return { id: { in: [] } };
  }

  const where: Prisma.DocumentWhereInput = {};

  if (filters.aerodromeId !== undefined) {
    where.aerodromeId = filters.aerodromeId;
  }
  if (filters.type !== undefined) {
    where.type = filters.type;
  }
  if (filters.search !== undefined && filters.search.length > 0) {
    where.originalFilename = { contains: filters.search, mode: 'insensitive' };
  }
  if (scope.kind === 'group') {
    where.aerodrome = { groupId: scope.groupId };
  }

  return where;
}
