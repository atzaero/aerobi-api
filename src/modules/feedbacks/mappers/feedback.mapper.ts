import { FeedbackRating, type Feedback } from '@/generated/prisma/client';

import { FeedbackResponseDTO } from '../dtos/feedback-response.dto';
import { FeedbackSummaryResponseDTO } from '../dtos/feedback-summary-response.dto';
import type { FeedbackRatingCount } from '../repositories/feedback.repository.interface';

/** Data-only no Prisma `@db.Date` → `YYYY-MM-DD` */
function formatPgDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export class FeedbackMapper {
  static toApiRow(entity: Feedback): FeedbackResponseDTO {
    const row = new FeedbackResponseDTO();
    row.id = entity.id;
    row.aerodromeId = entity.aerodromeId;
    row.rating = entity.rating;
    row.comment = entity.comment;
    row.sessionHash = entity.sessionHash;
    row.feedbackDate = formatPgDateOnly(entity.feedbackDate);
    row.createdAt = entity.createdAt.toISOString();
    row.createdBy = entity.createdBy;
    row.updatedAt = entity.updatedAt.toISOString();
    row.updatedBy = entity.updatedBy;
    row.deletedAt = entity.deletedAt ? entity.deletedAt.toISOString() : null;
    row.deletedBy = entity.deletedBy;
    return row;
  }

  static toApiRows(entities: Feedback[]): FeedbackResponseDTO[] {
    return entities.map((e) => FeedbackMapper.toApiRow(e));
  }

  /**
   * Projeta as contagens por avaliação (`groupBy`) no resumo público. Ratings
   * ausentes contam `0`; `total = positive + negative`.
   */
  static toSummary(
    aerodromeId: string,
    counts: FeedbackRatingCount[],
  ): FeedbackSummaryResponseDTO {
    const summary = new FeedbackSummaryResponseDTO();
    summary.aerodromeId = aerodromeId;
    summary.positive =
      counts.find((c) => c.rating === FeedbackRating.POSITIVE)?.count ?? 0;
    summary.negative =
      counts.find((c) => c.rating === FeedbackRating.NEGATIVE)?.count ?? 0;
    summary.total = summary.positive + summary.negative;
    return summary;
  }
}
