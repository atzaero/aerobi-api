import type {
  Feedback,
  FeedbackRating,
  Prisma,
} from '@/generated/prisma/client';

/** Contagem de feedbacks ativos agrupada por avaliação (para o `summary`). */
export interface FeedbackRatingCount {
  rating: FeedbackRating;
  count: number;
}

/** Linha mínima de feedback para agregação do dashboard (só a avaliação). */
export interface FeedbackDashboardRow {
  rating: FeedbackRating;
}

export interface IFeedbackRepository {
  create(data: Prisma.FeedbackCreateInput): Promise<Feedback>;

  findById(id: string): Promise<Feedback | null>;

  findMany(
    where: Prisma.FeedbackWhereInput,
    skip: number,
    take: number,
  ): Promise<Feedback[]>;

  count(where: Prisma.FeedbackWhereInput): Promise<number>;

  /**
   * Linhas mínimas para o dashboard (agregação em memória): filtradas por escopo
   * (`aerodromeIds` `null` = sem filtro; `[]` = nenhuma) e por `createdAt` no
   * intervalo `[fromMs, toMs]`.
   */
  findForDashboard(
    aerodromeIds: string[] | null,
    fromMs: number,
    toMs: number,
  ): Promise<FeedbackDashboardRow[]>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<Feedback>;

  /** `{ id }` do aeródromo ativo, ou `null` (inexistente/removido). */
  findActiveAerodrome(aerodromeId: string): Promise<{ id: string } | null>;

  /** Contagem de feedbacks ativos por avaliação, para um aeródromo. */
  summaryByAerodrome(aerodromeId: string): Promise<FeedbackRatingCount[]>;
}
