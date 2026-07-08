import type { Prisma } from '@/generated/prisma/client';

import { CreateTechnicalVisitDTO } from '../dtos/create-technical-visit.dto';
import { UpdateTechnicalVisitDTO } from '../dtos/update-technical-visit.dto';

export function buildTechnicalVisitCreateInput(
  dto: CreateTechnicalVisitDTO,
  actorId: string,
  createdAt: Date = new Date(),
): Prisma.TechnicalVisitCreateInput {
  const { aerodromeId, ...rest } = dto;
  return {
    ...rest,
    modifierUsers: [actorId],
    modifierAtTimes: [createdAt],
    createdBy: actorId,
    updatedBy: actorId,
    aerodrome: {
      connect: { id: aerodromeId },
    },
  };
}

/**
 * Monta o patch Prisma da visita. Campos `undefined` (ausentes no payload) viram
 * no-op no Prisma. `modifierUsers` é append-only (timeline de edições —
 * paridade `modifier_users` do web; o mesmo ator pode aparecer N vezes).
 */
export function patchTechnicalVisitToPrisma(
  dto: UpdateTechnicalVisitDTO,
  actorId: string,
  existingModifierUsers: string[],
  existingModifierAtTimes: Date[],
  modifiedAt: Date = new Date(),
): Prisma.TechnicalVisitUpdateInput {
  return {
    visitorName: dto.visitorName,
    city: dto.city,
    ciad: dto.ciad,
    designation: dto.designation,
    length: dto.length,
    width: dto.width,
    resistance: dto.resistance,
    surface: dto.surface,
    altitude: dto.altitude,
    gatesPadlocksObservation: dto.gatesPadlocksObservation,
    hasGatesPadlocks: dto.hasGatesPadlocks,
    fenceObservation: dto.fenceObservation,
    hasFence: dto.hasFence,
    standardPlateObservation: dto.standardPlateObservation,
    hasStandardPlate: dto.hasStandardPlate,
    qualityObservation: dto.qualityObservation,
    qualityOthersObservation: dto.qualityOthersObservation,
    hasQualityHoles: dto.hasQualityHoles,
    hasQualityAsphalt: dto.hasQualityAsphalt,
    hasQualityOthers: dto.hasQualityOthers,
    horizontalSignageObservation: dto.horizontalSignageObservation,
    hasHorizontalSignage: dto.hasHorizontalSignage,
    unobstructedHeadboardsObservation: dto.unobstructedHeadboardsObservation,
    hasUnobstructedHeadboards: dto.hasUnobstructedHeadboards,
    trackRangeObservation: dto.trackRangeObservation,
    hasTrackRange: dto.hasTrackRange,
    pavementRegularity: dto.pavementRegularity,
    trashDebrisObservation: dto.trashDebrisObservation,
    hasTrashDebris: dto.hasTrashDebris,
    delimitedPerimeterObservation: dto.delimitedPerimeterObservation,
    hasDelimitedPerimeter: dto.hasDelimitedPerimeter,
    hasInvasion: dto.hasInvasion,
    extraObservation: dto.extraObservation,
    visitAt: dto.visitAt,
    modifierUsers: [...existingModifierUsers, actorId],
    modifierAtTimes: [...existingModifierAtTimes, modifiedAt],
    updatedBy: actorId,
  };
}
