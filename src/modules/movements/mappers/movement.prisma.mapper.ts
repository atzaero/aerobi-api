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
 *
 * O `snapshot` (dados RAB congelados da aeronave) é sempre persistido via nested
 * create — atômico na mesma transação do movimento, mantendo a invariante 1:1
 * mesmo quando não há linha RAB correspondente (snapshot vazio).
 */
export function buildMovementCreateInput(
  dto: MovementCreateData,
  imageKey: string | null,
  origin: MovementOrigin,
  snapshot: Prisma.MovementAircraftSnapshotCreateWithoutMovementInput,
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
    // O service (fonte única) já resolve `operationType` antes de chamar este
    // mapper: AUTOMATIC pela regra toggle de 48h, MANUAL pelo formulário. O
    // fallback LANDING é apenas defensivo e não deve ser atingido na prática.
    operationType: origin.operationType ?? MovementType.LANDING,
    aircraftSnapshot: { create: snapshot },
  };
}
