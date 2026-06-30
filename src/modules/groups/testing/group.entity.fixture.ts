import type { Group } from '@/generated/prisma/client';
import { Uf } from '@/generated/prisma/client';

const t = new Date('2024-06-01T12:00:00.000Z');

export function buildGroupFixture(overrides: Partial<Group> = {}): Group {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    uf: Uf.SP,
    name: 'Interior',
    ownerId: null,
    deletionRequested: false,
    imageKey: null,
    createdAt: t,
    createdBy: null,
    updatedAt: t,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}
