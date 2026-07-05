import type { LandingRequest } from '@/generated/prisma/client';
import { LandingRequestStatus } from '@/generated/prisma/client';

const t = new Date('2024-06-01T12:00:00.000Z');

export function buildLandingRequestFixture(
  overrides: Partial<LandingRequest> = {},
): LandingRequest {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    aerodromeId: '22222222-2222-4222-8222-222222222222',
    status: LandingRequestStatus.PENDING,
    requestDate: t,
    email: 'p@e.com',
    pilotCode: null,
    aircraftModel: null,
    aircraftRegistration: null,
    departureAerodrome: null,
    observation: null,
    pilotName: null,
    pilotCpf: null,
    phoneContact: null,
    requesterName: null,
    peopleOnBoard: null,
    acceptedTerms: null,
    confirmedTrue: null,
    foreignRegistration: null,
    nextDestinationAerodrome: null,
    icao: null,
    uf: null,
    departureAt: null,
    landingAt: null,
    exitAfterLandingAt: null,
    reviewedAt: null,
    reviewedBy: null,
    createdAt: t,
    createdBy: null,
    updatedAt: t,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}
