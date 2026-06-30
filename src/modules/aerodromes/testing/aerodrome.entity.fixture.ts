import type { Aerodrome } from '@/generated/prisma/client';

const ts = new Date('2024-06-01T12:00:00.000Z');
const gid = '44444444-4444-4444-8444-444444444444';

export function buildAerodromeFixture(
  overrides: Partial<Aerodrome> = {},
): Aerodrome {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    groupId: gid,
    icao: 'SDXX',
    ciad: null,
    designation: null,
    length: null,
    width: null,
    resistance: null,
    surface: null,
    altitude: null,
    name: 'Aeródromo Teste',
    municipality: null,
    latitude: '10S',
    longitude: '20W',
    latitudeFormatted: null,
    longitudeFormatted: null,
    operation: null,
    lit: null,
    fueling: null,
    observation: null,
    construction: null,
    isOpen: true,
    isView: false,
    weatherStationCode: null,
    weatherStationDisplay: null,
    fileType: null,
    imgUrl: null,
    kmlUrl: null,
    registrationOrdinanceUrl: null,
    planOrdinanceUrl: null,
    grantTermUrl: null,
    aeronauticalStudyUrl: null,
    weatherUrl: null,
    windUrl: null,
    videoUrl: null,
    createdAt: ts,
    createdBy: null,
    updatedAt: ts,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}
