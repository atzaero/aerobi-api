import type { Prisma } from '@/generated/prisma/client';

import { CreateAircraftReadingDTO } from '../dtos/create-aircraft-reading.dto';

/**
 * Projeta o DTO de criação (+ a key da imagem já enviada ao storage) no input
 * de criação do Prisma.
 */
export function buildAircraftReadingCreateInput(
  dto: CreateAircraftReadingDTO,
  imageKey: string | null,
): Prisma.AircraftReadingCreateInput {
  return {
    registration: dto.registration,
    confidence: dto.confidence,
    readingDatetime: dto.reading_datetime,
    readingStatus: dto.reading_status,
    revisorId: dto.revisor_id,
    imageKey,
    comments: dto.comments,
    aerodrome: dto.aerodrome,
  };
}
