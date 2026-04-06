import type { Prisma } from '@/generated/prisma/client';

import type { PublicAerodromesFindAllQueryDTO } from '../dtos/public-aerodromes-find-all-query.dto';

const nullableStringContains = (
  value: string,
): Prisma.StringNullableFilter => ({
  contains: value,
  mode: 'insensitive',
});

/**
 * Builds Prisma where clause for public aerodrome listing from optional filters.
 */
export function buildPublicAerodromeWhereFromQuery(
  query: PublicAerodromesFindAllQueryDTO,
): Prisma.PublicAerodromeWhereInput {
  const where: Prisma.PublicAerodromeWhereInput = {};

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

  const municipioServido = t(query.municipioServido);
  if (municipioServido) {
    where.municipioServido = nullableStringContains(municipioServido);
  }

  const ufServido = t(query.ufServido);
  if (ufServido) {
    where.ufServido = nullableStringContains(ufServido);
  }

  const situacao = t(query.situacao);
  if (situacao) {
    where.situacao = nullableStringContains(situacao);
  }

  return where;
}
