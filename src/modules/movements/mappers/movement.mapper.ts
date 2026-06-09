import type { Movement } from '@/generated/prisma/client';

import { MovementResponseDTO } from '../dtos/movement-response.dto';

/**
 * Projeta a entidade em DTO de resposta (camelCase). A `imageUrl` (presigned) é
 * resolvida no service e injetada aqui — o mapper permanece síncrono/testável.
 */
export class MovementMapper {
  static toApiRow(
    entity: Movement,
    imageUrl: string | null,
  ): MovementResponseDTO {
    const row = new MovementResponseDTO();
    row.id = entity.id;
    row.registration = entity.registration;
    row.confidence = entity.confidence;
    row.readingDatetime = entity.readingDatetime.toISOString();
    row.readingStatus = entity.readingStatus;
    row.revisorId = entity.revisorId;
    row.imageUrl = imageUrl;
    row.comments = entity.comments;
    row.aerodrome = entity.aerodrome;
    row.createdAt = entity.createdAt.toISOString();
    row.updatedAt = entity.updatedAt.toISOString();
    return row;
  }
}
