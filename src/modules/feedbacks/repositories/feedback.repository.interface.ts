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

export interface IFeedbackRepository {
  create(data: Prisma.FeedbackCreateInput): Promise<Feedback>;

  findById(id: string): Promise<Feedback | null>;

  findMany(
    where: Prisma.FeedbackWhereInput,
    skip: number,
    take: number,
  ): Promise<Feedback[]>;

  count(where: Prisma.FeedbackWhereInput): Promise<number>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<Feedback>;

  /** `{ id }` do aeródromo ativo, ou `null` (inexistente/removido). */
  findActiveAerodrome(aerodromeId: string): Promise<{ id: string } | null>;

  /** Contagem de feedbacks ativos por avaliação, para um aeródromo. */
  summaryByAerodrome(aerodromeId: string): Promise<FeedbackRatingCount[]>;
}
