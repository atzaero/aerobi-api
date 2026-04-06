import type { Prisma } from '@/generated/prisma/client';

import type { PrivateAerodromesFindAllQueryDTO } from '../dtos/private-aerodromes-find-all-query.dto';

const nullableStringContains = (
  value: string,
): Prisma.StringNullableFilter => ({
  contains: value,
  mode: 'insensitive',
});

/**
 * Builds Prisma where clause for private aerodrome listing from optional filters.
 */
export function buildPrivateAerodromeWhereFromQuery(
  query: PrivateAerodromesFindAllQueryDTO,
): Prisma.PrivateAerodromeWhereInput {
  const where: Prisma.PrivateAerodromeWhereInput = {};

  const t = (s: string | undefined): string | undefined =>
    s?.trim() ? s.trim() : undefined;

  const ciad = t(query.ciad);
  if (ciad) {
    where.ciad = { contains: ciad, mode: 'insensitive' };
  }

  const codigoOaci = t(query.codigoOaci);
  if (codigoOaci) {
    where.codigoOaci = nullableStringContains(codigoOaci);
  }

  const nome = t(query.nome);
  if (nome) {
    where.nome = nullableStringContains(nome);
  }

  const municipio = t(query.municipio);
  if (municipio) {
    where.municipio = nullableStringContains(municipio);
  }

  const uf = t(query.uf);
  if (uf) {
    where.uf = nullableStringContains(uf);
  }

  return where;
}
