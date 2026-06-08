import type { AircraftReading } from '@/generated/prisma/client';

import { AircraftReadingResponseDTO } from '../dtos/aircraft-reading-response.dto';

/**
 * Projeta a entidade em DTO de resposta (camelCase). A `imageUrl` (presigned) é
 * resolvida no service e injetada aqui — o mapper permanece síncrono/testável.
 */
export class AircraftReadingMapper {
  static toApiRow(
    entity: AircraftReading,
    imageUrl: string | null,
  ): AircraftReadingResponseDTO {
    const row = new AircraftReadingResponseDTO();
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
