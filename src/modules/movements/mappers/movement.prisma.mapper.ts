import type { Prisma } from '@/generated/prisma/client';
import { MovementType } from '@/generated/prisma/enums';

import type { MovementOrigin } from '../services/movement-origin';

/**
 * Campos do DTO consumidos pela projeção. Estrutural de propósito: tanto a
 * ingestão AUTOMATIC (`CreateMovementDTO`, com `confidence`) quanto a criação
 * MANUAL (sem `confidence`) satisfazem este shape.
 */
export interface MovementCreateData {
  registration: string;
  reading_datetime: Date;
  confidence?: string;
  reading_status?: string;
  revisor_id?: string;
  comments?: string;
  aerodrome?: string;
}

/**
 * Projeta o DTO de criação (+ a key da imagem já enviada ao storage) no input
 * de criação do Prisma. A `origin` define `source` e `createdBy` (e, quando
 * fornecido, `operationType`) conforme o caminho de criação (AUTOMATIC vs MANUAL).
 */
export function buildMovementCreateInput(
  dto: MovementCreateData,
  imageKey: string | null,
  origin: MovementOrigin,
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
    source: origin.source,
    createdBy: origin.createdBy,
    // TODO(#234): para a ingestão AUTOMATIC, `operationType` ainda é o placeholder
    // LANDING — a inferência pela regra de 48h será implementada na #234. No
    // caminho MANUAL a origem já fornece o `operationType` real do formulário.
    operationType: origin.operationType ?? MovementType.LANDING,
  };
}
