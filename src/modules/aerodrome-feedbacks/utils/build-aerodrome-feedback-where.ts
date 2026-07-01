import type { UserGroupScope } from '@/common/utils/group-scope.util';
import type { FeedbackRating, Prisma } from '@/generated/prisma/client';

/** Filtros comuns de listagem/exportação de feedbacks (moderação interna). */
export interface AerodromeFeedbackFilters {
  aerodromeId?: string;
  rating?: FeedbackRating;
  /** `YYYY-MM-DD` inclusivo (validado no DTO); filtra `feedbackDate`. */
  startDate?: string;
  /** `YYYY-MM-DD` inclusivo (validado no DTO); filtra `feedbackDate`. */
  endDate?: string;
}

/**
 * Converte um `YYYY-MM-DD` (já validado como data de calendário no DTO) na
 * meia-noite UTC daquele dia — o mesmo instante gravado em `feedbackDate`
 * (`@db.Date`), de modo que o range `gte startDate`/`lte endDate` seja inclusivo
 * nas duas pontas.
 */
function ymdToUtcMidnight(ymd: string): Date {
  return new Date(`${ymd}T00:00:00.000Z`);
}

/**
 * Monta o intervalo de `feedbackDate` a partir de `startDate`/`endDate` — ou
 * `undefined` quando nenhum foi informado (para não escrever uma chave vazia no
 * `where`).
 */
function buildFeedbackDateRange(
  filters: AerodromeFeedbackFilters,
): Prisma.DateTimeFilter | undefined {
  const range: Prisma.DateTimeFilter = {};
  if (filters.startDate !== undefined) {
    range.gte = ymdToUtcMidnight(filters.startDate);
  }
  if (filters.endDate !== undefined) {
    range.lte = ymdToUtcMidnight(filters.endDate);
  }
  return range.gte !== undefined || range.lte !== undefined ? range : undefined;
}

/**
 * Monta o `where` de feedbacks a partir dos filtros + escopo de grupo do ator,
 * garantindo o invariante de segurança num único ponto (list e export reusam):
 *
 *  - `none`  — COORDINATOR sem grupo: `id: { in: [] }` **nunca casa** nada
 *              (fail-closed, jamais "fail open").
 *  - `group` — restringe via relação (`aerodrome: { groupId }`), pois o feedback
 *              não tem `groupId` próprio — deriva do aeródromo dono.
 *  - `all`   — ADMIN: sem restrição de grupo.
 *
 * O `deletedAt: null` (soft-delete) é aplicado no repositório, não aqui.
 */
export function buildAerodromeFeedbackScopedWhere(
  filters: AerodromeFeedbackFilters,
  scope: UserGroupScope,
): Prisma.AerodromeFeedbackWhereInput {
  if (scope.kind === 'none') {
    return { id: { in: [] } };
  }

  const where: Prisma.AerodromeFeedbackWhereInput = {};

  if (filters.aerodromeId !== undefined) {
    where.aerodromeId = filters.aerodromeId;
  }
  if (filters.rating !== undefined) {
    where.rating = filters.rating;
  }
  const feedbackDate = buildFeedbackDateRange(filters);
  if (feedbackDate !== undefined) {
    where.feedbackDate = feedbackDate;
  }

  if (scope.kind === 'group') {
    where.aerodrome = { groupId: scope.groupId };
  }

  return where;
}
