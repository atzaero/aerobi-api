import type { UserGroupScope } from '@/common/utils/group-scope.util';
import type { Prisma } from '@/generated/prisma/client';

import type { ListTechnicalVisitsQueryDTO } from '../dtos/list-technical-visits-query.dto';

/** `contains` case-insensitive — filtro `search` do web. */
const substring = (value: string): Prisma.StringFilter => ({
  contains: value,
  mode: 'insensitive',
});

/**
 * Monta o `where` da listagem de visitas técnicas a partir dos filtros + escopo
 * operacional do ator (paridade `listTechnicalVisitsAction` do web).
 */
export function buildTechnicalVisitScopedWhere(
  query: ListTechnicalVisitsQueryDTO,
  scope: UserGroupScope,
): Prisma.TechnicalVisitWhereInput {
  if (scope.kind === 'none') {
    return { id: { in: [] } };
  }

  const where: Prisma.TechnicalVisitWhereInput = {};

  if (query.aerodromeId !== undefined) {
    where.aerodromeId = query.aerodromeId;
  }

  const search = query.search?.trim();
  if (search) {
    where.OR = [
      { visitorName: substring(search) },
      { city: substring(search) },
      { aerodrome: { icao: substring(search) } },
      { aerodrome: { name: substring(search) } },
    ];
  }

  if (scope.kind === 'group') {
    where.aerodrome = { groupId: scope.groupId };
  }

  return where;
}
