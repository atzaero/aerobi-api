import type { AerodromeFeedback } from '@/generated/prisma/client';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';

/** Data-only no Prisma `@db.Date` → `YYYY-MM-DD` */
function formatPgDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export class AerodromeFeedbackMapper {
  static toApiRow(entity: AerodromeFeedback): AerodromeFeedbackResponseDTO {
    const row = new AerodromeFeedbackResponseDTO();
    row.id = entity.id;
    row.operationalAerodromeId = entity.operationalAerodromeId;
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

  static toApiRows(
    entities: AerodromeFeedback[],
  ): AerodromeFeedbackResponseDTO[] {
    return entities.map((e) => AerodromeFeedbackMapper.toApiRow(e));
  }
}
