import type { TechnicalVisit } from '@/generated/prisma/client';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';

export class TechnicalVisitMapper {
  static toApiRow(entity: TechnicalVisit): TechnicalVisitResponseDTO {
    const row = new TechnicalVisitResponseDTO();
    row.id = entity.id;
    row.operationalAerodromeId = entity.operationalAerodromeId;
    row.modifierUsers = [...entity.modifierUsers];
    row.gatesPadlocksObservation = entity.gatesPadlocksObservation;
    row.hasGatesPadlocks = entity.hasGatesPadlocks;
    row.fenceObservation = entity.fenceObservation;
    row.hasFence = entity.hasFence;
    row.standardPlateObservation = entity.standardPlateObservation;
    row.hasStandardPlate = entity.hasStandardPlate;
    row.qualityObservation = entity.qualityObservation;
    row.qualityOthersObservation = entity.qualityOthersObservation;
    row.hasQualityHoles = entity.hasQualityHoles;
    row.hasQualityAsphalt = entity.hasQualityAsphalt;
    row.hasQualityOthers = entity.hasQualityOthers;
    row.horizontalSignageObservation = entity.horizontalSignageObservation;
    row.hasHorizontalSignage = entity.hasHorizontalSignage;
    row.unobstructedHeadboardsObservation =
      entity.unobstructedHeadboardsObservation;
    row.hasUnobstructedHeadboards = entity.hasUnobstructedHeadboards;
    row.trackRangeObservation = entity.trackRangeObservation;
    row.hasTrackRange = entity.hasTrackRange;
    row.pavementRegularity = entity.pavementRegularity;
    row.trashDebrisObservation = entity.trashDebrisObservation;
    row.hasTrashDebris = entity.hasTrashDebris;
    row.delimitedPerimeterObservation = entity.delimitedPerimeterObservation;
    row.hasDelimitedPerimeter = entity.hasDelimitedPerimeter;
    row.hasInvasion = entity.hasInvasion;
    row.extraObservation = entity.extraObservation;
    row.visitAt = entity.visitAt.toISOString();
    row.visitBy = entity.visitBy;
    row.createdAt = entity.createdAt.toISOString();
    row.createdBy = entity.createdBy;
    row.updatedAt = entity.updatedAt.toISOString();
    row.updatedBy = entity.updatedBy;
    row.deletedAt = entity.deletedAt ? entity.deletedAt.toISOString() : null;
    row.deletedBy = entity.deletedBy;
    return row;
  }

  static toApiRows(entities: TechnicalVisit[]): TechnicalVisitResponseDTO[] {
    return entities.map((e) => TechnicalVisitMapper.toApiRow(e));
  }
}
