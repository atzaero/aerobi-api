import type { Camera } from '@/generated/prisma/client';

const t = new Date('2024-06-01T12:00:00.000Z');

/** Fixture de entidade `Camera` para specs (sobrescrevível por `overrides`). */
export function buildCameraFixture(overrides: Partial<Camera> = {}): Camera {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    aerodromeId: '22222222-2222-4222-8222-222222222222',
    icao: 'SBXX',
    name: 'Cabeceira 06',
    mediamtxNode: 'aerobi-edge-mvp',
    mediamtxPath: 'sbxx-cam-1',
    enabled: true,
    createdAt: t,
    createdBy: null,
    updatedAt: t,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}
