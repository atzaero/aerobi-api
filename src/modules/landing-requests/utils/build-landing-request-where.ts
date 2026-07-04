import type { UserGroupScope } from '@/common/utils/group-scope.util';
import type { Prisma } from '@/generated/prisma/client';

import type { LandingRequestFilterQueryDTO } from '../dtos/landing-request-filter-query.dto';

/** `contains` case-insensitive — filtros textuais de substring do web. */
const substring = (value: string): Prisma.StringNullableFilter => ({
  contains: value,
  mode: 'insensitive',
});

/** Início do dia UTC de um `YYYY-MM-DD` (já validado no DTO). */
function startOfUtcDay(ymd: string): Date {
  return new Date(`${ymd}T00:00:00.000Z`);
}

/** Fim do dia UTC de um `YYYY-MM-DD` (inclusivo). */
function endOfUtcDay(ymd: string): Date {
  return new Date(`${ymd}T23:59:59.999Z`);
}

/**
 * Monta um intervalo de timestamp inclusivo a partir de `from`/`to` (`YYYY-MM-DD`)
 * — ou `undefined` quando nenhum foi informado (não escreve chave vazia). O tipo
 * estrutural `{ gte?; lte? }` é aceito tanto por `requestDate` (não-nulável)
 * quanto por `reviewedAt` (nulável).
 */
function buildDateRange(
  from: string | undefined,
  to: string | undefined,
): { gte?: Date; lte?: Date } | undefined {
  const range: { gte?: Date; lte?: Date } = {};
  if (from !== undefined) {
    range.gte = startOfUtcDay(from);
  }
  if (to !== undefined) {
    range.lte = endOfUtcDay(to);
  }
  return range.gte !== undefined || range.lte !== undefined ? range : undefined;
}

/**
 * Monta o `where` de solicitações de pouso a partir dos filtros + escopo de
 * grupo do ator, garantindo o invariante de segurança num único ponto (list,
 * export e pending-count reusam):
 *
 *  - `none`  — papel restrito sem grupo: `id: { in: [] }` **nunca casa** nada
 *              (fail-closed, jamais "fail open").
 *  - `group` — restringe via relação (`aerodrome: { groupId }`), pois a
 *              solicitação não tem `groupId` próprio — deriva do aeródromo dono.
 *  - `all`   — ADMIN: sem restrição de grupo.
 *
 * `status`/`aerodromeId` por igualdade; ICAO/modelo/matrícula/pilotCode/email por
 * substring case-insensitive; `requestDate`/`reviewedAt` por range inclusivo. O
 * `deletedAt: null` (soft-delete) é aplicado no repositório, não aqui.
 */
export function buildLandingRequestScopedWhere(
  filters: LandingRequestFilterQueryDTO,
  scope: UserGroupScope,
): Prisma.LandingRequestWhereInput {
  if (scope.kind === 'none') {
    return { id: { in: [] } };
  }

  const where: Prisma.LandingRequestWhereInput = {};

  if (filters.aerodromeId !== undefined) {
    where.aerodromeId = filters.aerodromeId;
  }
  if (filters.status !== undefined) {
    where.status = filters.status;
  }
  if (filters.departureIcao !== undefined) {
    where.departureAerodrome = substring(filters.departureIcao);
  }
  if (filters.arrivalIcao !== undefined) {
    where.icao = substring(filters.arrivalIcao);
  }
  if (filters.aircraftModel !== undefined) {
    where.aircraftModel = substring(filters.aircraftModel);
  }
  if (filters.aircraftRegistration !== undefined) {
    where.aircraftRegistration = substring(filters.aircraftRegistration);
  }
  if (filters.pilotCode !== undefined) {
    where.pilotCode = substring(filters.pilotCode);
  }
  if (filters.email !== undefined) {
    where.email = substring(filters.email);
  }

  const requestDate = buildDateRange(
    filters.requestDateFrom,
    filters.requestDateTo,
  );
  if (requestDate !== undefined) {
    where.requestDate = requestDate;
  }
  const reviewedAt = buildDateRange(
    filters.responseDateFrom,
    filters.responseDateTo,
  );
  if (reviewedAt !== undefined) {
    where.reviewedAt = reviewedAt;
  }

  if (scope.kind === 'group') {
    where.aerodrome = { groupId: scope.groupId };
  }

  return where;
}
