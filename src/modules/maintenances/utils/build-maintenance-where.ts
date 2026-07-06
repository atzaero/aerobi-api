import type { UserGroupScope } from '@/common/utils/group-scope.util';
import type { Prisma, Uf } from '@/generated/prisma/client';

/** Filtros comuns de listagem/exportação de intervenções. */
export interface MaintenanceFilters {
  name?: string;
  aerodromeId?: string;
  aerodromeName?: string;
  uf?: Uf;
  publicAccess?: boolean;
  overduePending?: boolean;
}

/**
 * Monta o `where` de intervenções a partir dos filtros + escopo de grupo do ator.
 * Filtros `overduePending` são aplicados em memória após enriquecer com tarefas.
 */
export function buildMaintenanceScopedWhere(
  filters: MaintenanceFilters,
  scope: UserGroupScope,
): Prisma.MaintenanceWhereInput {
  if (scope.kind === 'none') {
    return { id: { in: [] } };
  }

  const where: Prisma.MaintenanceWhereInput = {};

  if (filters.name !== undefined) {
    where.name = { contains: filters.name, mode: 'insensitive' };
  }
  if (filters.aerodromeId !== undefined) {
    where.aerodromeId = filters.aerodromeId;
  }

  const aerodromeWhere: Prisma.AerodromeWhereInput = {};
  if (filters.uf !== undefined) {
    aerodromeWhere.group = { uf: filters.uf };
  }
  if (filters.aerodromeName !== undefined) {
    const term = filters.aerodromeName.trim();
    aerodromeWhere.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { icao: { contains: term, mode: 'insensitive' } },
      { municipality: { contains: term, mode: 'insensitive' } },
    ];
  }
  if (scope.kind === 'group') {
    aerodromeWhere.groupId = scope.groupId;
  }
  if (Object.keys(aerodromeWhere).length > 0) {
    where.aerodrome = aerodromeWhere;
  }

  if (filters.publicAccess === true) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      { authorizedEmails: { isEmpty: false } },
      { securityCode: { not: null } },
      { NOT: { securityCode: '' } },
    ];
  } else if (filters.publicAccess === false) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      {
        OR: [
          { authorizedEmails: { isEmpty: true } },
          { securityCode: null },
          { securityCode: '' },
        ],
      },
    ];
  }

  return where;
}

/** Filtra itens enriquecidos por `overduePending` quando informado. */
export function applyOverduePendingFilter<
  T extends { overduePendingCount: number },
>(items: T[], overduePending?: boolean): T[] {
  if (overduePending === undefined) return items;
  return items.filter((item) =>
    overduePending
      ? item.overduePendingCount > 0
      : item.overduePendingCount === 0,
  );
}
