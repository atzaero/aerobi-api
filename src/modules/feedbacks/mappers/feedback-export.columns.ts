import type { CsvColumn } from '@/common/utils/csv.util';
import { type Feedback, FeedbackRating } from '@/generated/prisma/client';

/**
 * Rótulos pt-BR da avaliação para o CSV — espelha `FEEDBACK_RATING_LABELS` do
 * `aerobi-web` (`positive`→"Positiva", `negative`→"Negativa").
 */
const RATING_LABELS: Record<FeedbackRating, string> = {
  [FeedbackRating.POSITIVE]: 'Positiva',
  [FeedbackRating.NEGATIVE]: 'Negativa',
};

/**
 * Colunas do export CSV de feedbacks — as **4 colunas do web** (`export/
 * columns.ts`), na mesma ordem e com os mesmos rótulos: ID do aeródromo, a
 * avaliação traduzida, o comentário (vazio quando ausente) e o `createdAt` em
 * ISO 8601 (UTC).
 */
export const feedbackExportColumns: CsvColumn<Feedback>[] = [
  { header: 'Aeródromo (ID)', accessor: (f) => f.aerodromeId },
  { header: 'Avaliação', accessor: (f) => RATING_LABELS[f.rating] ?? f.rating },
  { header: 'Comentário', accessor: (f) => f.comment ?? '' },
  { header: 'Criado em (UTC)', accessor: (f) => f.createdAt.toISOString() },
];
