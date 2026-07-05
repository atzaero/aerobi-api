import { LandingRequestStatus } from '@/generated/prisma/client';

import { resolveLandingRequestOrderBy } from './list-order';

describe('resolveLandingRequestOrderBy', () => {
  it('default (sem filtro): pendentes primeiro, requestDate asc (FIFO)', () => {
    expect(resolveLandingRequestOrderBy()).toEqual([
      { status: 'asc' },
      { requestDate: 'asc' },
      { id: 'asc' },
    ]);
  });

  it('status=pending: fila FIFO (requestDate asc)', () => {
    expect(resolveLandingRequestOrderBy(LandingRequestStatus.PENDING)).toEqual([
      { status: 'asc' },
      { requestDate: 'asc' },
      { id: 'asc' },
    ]);
  });

  it('status=approved: histórico recente primeiro (responseDate desc)', () => {
    expect(resolveLandingRequestOrderBy(LandingRequestStatus.APPROVED)).toEqual(
      [{ reviewedAt: 'desc' }, { requestDate: 'desc' }, { id: 'desc' }],
    );
  });

  it('status=rejected: histórico recente primeiro (responseDate desc)', () => {
    expect(resolveLandingRequestOrderBy(LandingRequestStatus.REJECTED)).toEqual(
      [{ reviewedAt: 'desc' }, { requestDate: 'desc' }, { id: 'desc' }],
    );
  });
});
