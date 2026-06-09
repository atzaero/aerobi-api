import type { Prisma } from '@/generated/prisma/client';
import { MovementSource, MovementType } from '@/generated/prisma/enums';

import { CreateMovementDTO } from '../dtos/create-movement.dto';

/**
 * Projeta o DTO de criação (+ a key da imagem já enviada ao storage) no input
 * de criação do Prisma.
 */
export function buildMovementCreateInput(
  dto: CreateMovementDTO,
  imageKey: string | null,
): Prisma.MovementCreateInput {
  return {
    registration: dto.registration,
    confidence: dto.confidence,
    readingDatetime: dto.reading_datetime,
    readingStatus: dto.reading_status,
    revisorId: dto.revisor_id,
    imageKey,
    comments: dto.comments,
    aerodrome: dto.aerodrome,
    // Placeholders temporários — este refactor (#231) apenas renomeia o módulo.
    // TODO(#232): definir `source` conforme a origem real (AUTOMATIC/MANUAL).
    // TODO(#234): inferir `operationType` pela regra de 48h na ingestão AUTOMATIC.
    operationType: MovementType.LANDING,
    source: MovementSource.AUTOMATIC,
  };
}
