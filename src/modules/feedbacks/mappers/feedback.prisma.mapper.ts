import type { FeedbackRating, Prisma } from '@/generated/prisma/client';

/**
 * Dados já resolvidos para persistir um feedback: os campos do cliente
 * (`aerodromeId`/`rating`/`comment`/`sessionHash`) mais os **derivados no
 * servidor** (`feedbackDate` = dia UTC). `createdBy` é sempre `null` (envio
 * anônimo, sem ator).
 */
export interface FeedbackCreateData {
  aerodromeId: string;
  rating: FeedbackRating;
  comment?: string | null;
  sessionHash: string;
  feedbackDate: Date;
}

/**
 * Projeta os dados resolvidos no `create` do Prisma. Builder puro (sem I/O):
 * concentra a montagem do payload de escrita, deixando o repositório só persistir.
 */
export function buildFeedbackCreateInput(
  data: FeedbackCreateData,
): Prisma.FeedbackCreateInput {
  return {
    aerodrome: { connect: { id: data.aerodromeId } },
    rating: data.rating,
    /**
     * Normaliza "sem comentário" a um único estado: `undefined`, `null` e a
     * string vazia (ex.: cliente enviou só espaços, trimados no DTO) viram
     * `null` — evita que dois inputs semanticamente iguais gravem valores
     * distintos.
     */
    comment: data.comment ? data.comment : null,
    sessionHash: data.sessionHash,
    feedbackDate: data.feedbackDate,
    createdBy: null,
  };
}
