import type { Movement } from '@/generated/prisma/client';

import { MovementListItemMapper } from './movement-list-item.mapper';

describe('MovementListItemMapper', () => {
  const entity = (over: Partial<Movement> = {}): Movement => ({
    id: 'r-1',
    registration: 'PRZTT',
    confidence: '0.98',
    readingDatetime: new Date('2026-06-08T16:52:39Z'),
    operationType: 'LANDING',
    source: 'AUTOMATIC',
    readingStatus: 'APPROVED',
    revisorId: 'rev-1',
    imageKey: 'readings/2026/06/a.jpg',
    comments: 'nota',
    aerodrome: 'SSCF',
    createdAt: new Date('2026-06-08T16:52:40Z'),
    updatedAt: new Date('2026-06-08T16:52:41Z'),
    deletedAt: null,
    createdBy: null,
    updatedBy: null,
    deletedBy: null,
    ...over,
  });

  it('projeta apenas os campos do card e injeta a imageUrl', () => {
    const row = MovementListItemMapper.toListItem(entity(), 'https://signed/a');

    expect(row).toEqual({
      id: 'r-1',
      registration: 'PRZTT',
      aerodrome: 'SSCF',
      readingDatetime: '2026-06-08T16:52:39.000Z',
      imageUrl: 'https://signed/a',
      operationType: 'LANDING',
      source: 'AUTOMATIC',
    });
  });

  it('omite snapshot/status/revisor/comments/timestamps e confidence', () => {
    const row = MovementListItemMapper.toListItem(entity(), null);

    expect(row).not.toHaveProperty('aircraftSnapshot');
    expect(row).not.toHaveProperty('readingStatus');
    expect(row).not.toHaveProperty('revisorId');
    expect(row).not.toHaveProperty('comments');
    expect(row).not.toHaveProperty('createdAt');
    expect(row).not.toHaveProperty('updatedAt');
    expect(row).not.toHaveProperty('confidence');
  });

  it('propaga imageUrl null e aerodrome null', () => {
    const row = MovementListItemMapper.toListItem(
      entity({ aerodrome: null }),
      null,
    );

    expect(row.imageUrl).toBeNull();
    expect(row.aerodrome).toBeNull();
  });
});
