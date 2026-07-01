import type {
  AerodromeFeedback,
  FeedbackRating,
  Prisma,
} from '@/generated/prisma/client';

/** Contagem de feedbacks ativos agrupada por avaliação (para o `summary`). */
export interface FeedbackRatingCount {
  rating: FeedbackRating;
  count: number;
}

export interface IAerodromeFeedbackRepository {
  create(data: Prisma.AerodromeFeedbackCreateInput): Promise<AerodromeFeedback>;

  findById(id: string): Promise<AerodromeFeedback | null>;

  findMany(
    where: Prisma.AerodromeFeedbackWhereInput,
    skip: number,
    take: number,
  ): Promise<AerodromeFeedback[]>;

  count(where: Prisma.AerodromeFeedbackWhereInput): Promise<number>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<AerodromeFeedback>;

  /** `{ id }` do aeródromo ativo, ou `null` (inexistente/removido). */
  findActiveAerodrome(aerodromeId: string): Promise<{ id: string } | null>;

  /** Contagem de feedbacks ativos por avaliação, para um aeródromo. */
  summaryByAerodrome(aerodromeId: string): Promise<FeedbackRatingCount[]>;
}
