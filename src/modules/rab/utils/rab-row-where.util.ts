import type { Prisma } from '@/generated/prisma/client';

import type { RabRowsFindAllQueryDTO } from '../dtos/rab-rows-find-all-query.dto';

const marcasContains = (value: string): Prisma.StringFilter => ({
  contains: value,
  mode: 'insensitive',
});

const nullableStringContains = (
  value: string,
): Prisma.StringNullableFilter => ({
  contains: value,
  mode: 'insensitive',
});

/**
 * Builds Prisma where clause for RAB row listing: resolved period + optional partial filters.
 */
export function buildRabRowWhereFromQuery(
  query: RabRowsFindAllQueryDTO,
  resolvedPeriod: string,
): Prisma.RabRowWhereInput {
  const where: Prisma.RabRowWhereInput = {
    period: resolvedPeriod,
  };

  const t = (s: string | undefined): string | undefined =>
    s?.trim() ? s.trim() : undefined;

  const marcas = t(query.marcas);
  if (marcas) {
    where.marcas = marcasContains(marcas);
  }

  const nrCertMatricula = t(query.nrCertMatricula);
  if (nrCertMatricula) {
    where.nrCertMatricula = nullableStringContains(nrCertMatricula);
  }

  const nmFabricante = t(query.nmFabricante);
  if (nmFabricante) {
    where.nmFabricante = nullableStringContains(nmFabricante);
  }

  const dsModelo = t(query.dsModelo);
  if (dsModelo) {
    where.dsModelo = nullableStringContains(dsModelo);
  }

  const cdTipoIcao = t(query.cdTipoIcao);
  if (cdTipoIcao) {
    where.cdTipoIcao = nullableStringContains(cdTipoIcao);
  }

  return where;
}
