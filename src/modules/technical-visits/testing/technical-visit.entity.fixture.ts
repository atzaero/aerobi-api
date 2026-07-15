import type { TechnicalVisit } from '@/generated/prisma/client';

import type { TechnicalVisitWithAerodrome } from '../types/technical-visit-with-aerodrome.type';

const t = new Date('2024-06-01T12:00:00.000Z');
const visitAt = new Date('2024-05-20T10:00:00.000Z');

export function buildTechnicalVisitFixture(
  overrides: Partial<TechnicalVisit> = {},
): TechnicalVisit {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    aerodromeId: '22222222-2222-4222-8222-222222222222',
    visitorName: 'Vistoriador Teste',
    city: 'Goiânia',
    ciad: null,
    designation: null,
    length: null,
    width: null,
    resistance: null,
    surface: null,
    altitude: null,
    modifierUsers: [],
    modifierAtTimes: [],
    gatesPadlocksObservation: null,
    hasGatesPadlocks: null,
    fenceObservation: null,
    hasFence: null,
    standardPlateObservation: null,
    hasStandardPlate: null,
    qualityObservation: null,
    qualityOthersObservation: null,
    hasQualityHoles: null,
    hasQualityAsphalt: null,
    hasQualityOthers: null,
    horizontalSignageObservation: null,
    hasHorizontalSignage: null,
    unobstructedHeadboardsObservation: null,
    hasUnobstructedHeadboards: null,
    trackRangeObservation: null,
    hasTrackRange: null,
    pavementRegularity: null,
    trashDebrisObservation: null,
    hasTrashDebris: null,
    delimitedPerimeterObservation: null,
    hasDelimitedPerimeter: null,
    hasInvasion: null,
    extraObservation: null,
    visitAt,
    visitBy: null,
    createdAt: t,
    createdBy: null,
    updatedAt: t,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}

export function buildTechnicalVisitWithAerodromeFixture(
  overrides: Partial<TechnicalVisitWithAerodrome> = {},
): TechnicalVisitWithAerodrome {
  return {
    ...buildTechnicalVisitFixture(),
    aerodrome: {
      icao: 'SBGO',
      name: 'Aeródromo Teste',
      group: { uf: 'GO' },
    },
    ...overrides,
  };
}
