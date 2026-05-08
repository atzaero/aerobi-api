import type { PilotLanding } from '@/generated/prisma/client';

const now = new Date('2024-06-01T12:00:00.000Z');

/** Mínimo válido para {@link PilotLandingMapper.toApiRow}. */
export function buildPilotLandingFixture(
  overrides: Partial<PilotLanding> = {},
): PilotLanding {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    operationalAerodromeId: '22222222-2222-4222-8222-222222222222',
    registration: 'PT-ABC',
    localName: 'Campo Teste',
    localIcao: 'SDXX',
    checked: true,
    imagesPath: 'landings/pt-abc',
    landingAt: now,
    createdAt: now,
    createdBy: 'user-1',
    updatedAt: now,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}
