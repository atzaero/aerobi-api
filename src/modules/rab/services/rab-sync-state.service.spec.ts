import { RabSyncStatus, type RabSyncState } from '@/generated/prisma/client';

import type { RabSyncStateRepository } from '../repositories/rab-sync-state.repository';

import { RabSyncStateService } from './rab-sync-state.service';

function mockState(overrides: Partial<RabSyncState> = {}): RabSyncState {
  return {
    id: 'state-1',
    period: '2026-03',
    sourceUrl: 'https://anac/2026-03.csv',
    lastModified: null,
    contentLength: BigInt(1024),
    contentHash: null,
    parsedRowCount: 10,
    syncedAt: null,
    status: RabSyncStatus.SUCCESS,
    errorMessage: null,
    ...overrides,
  };
}

describe('RabSyncStateService', () => {
  it('busca os estados por período desc e serializa via mapper (BigInt → string)', async () => {
    const findManyOrderByPeriodDesc = jest
      .fn()
      .mockResolvedValue([mockState({ contentLength: BigInt(2048) })]);
    const repo = {
      findManyOrderByPeriodDesc,
    } as unknown as RabSyncStateRepository;
    const service = new RabSyncStateService(repo);

    const result = await service.execute();

    expect(findManyOrderByPeriodDesc).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].contentLength).toBe('2048');
  });

  it('retorna lista vazia quando não há estados', async () => {
    const repo = {
      findManyOrderByPeriodDesc: jest.fn().mockResolvedValue([]),
    } as unknown as RabSyncStateRepository;

    await expect(new RabSyncStateService(repo).execute()).resolves.toEqual([]);
  });
});
