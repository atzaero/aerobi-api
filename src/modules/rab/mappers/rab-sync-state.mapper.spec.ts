import { RabSyncStatus, type RabSyncState } from '@/generated/prisma/client';

import { RabSyncStateMapper } from './rab-sync-state.mapper';

function mockState(overrides: Partial<RabSyncState> = {}): RabSyncState {
  return {
    id: 'state-1',
    period: '2026-03',
    sourceUrl: 'https://anac/2026-03.csv',
    lastModified: 'Mon, 02 Mar 2026 00:00:00 GMT',
    contentLength: BigInt(1024),
    contentHash: 'abc123',
    parsedRowCount: 42,
    syncedAt: new Date('2026-03-02T00:00:00.000Z'),
    status: RabSyncStatus.SUCCESS,
    errorMessage: null,
    ...overrides,
  };
}

describe('RabSyncStateMapper', () => {
  describe('toApiRow', () => {
    it('serializa contentLength (BigInt) para string, preservando os demais campos', () => {
      const state = mockState({ contentLength: BigInt(2048) });

      const row = RabSyncStateMapper.toApiRow(state);

      expect(row.contentLength).toBe('2048');
      expect(row).toMatchObject({
        id: 'state-1',
        period: '2026-03',
        parsedRowCount: 42,
        status: RabSyncStatus.SUCCESS,
      });
    });

    it('mantém contentLength null como null', () => {
      const row = RabSyncStateMapper.toApiRow(
        mockState({ contentLength: null }),
      );

      expect(row.contentLength).toBeNull();
    });
  });

  describe('toApiRows', () => {
    it('mapeia cada item do array', () => {
      const rows = RabSyncStateMapper.toApiRows([
        mockState({ period: '2026-03', contentLength: BigInt(10) }),
        mockState({ period: '2026-02', contentLength: null }),
      ]);

      expect(rows).toHaveLength(2);
      expect(rows[0].contentLength).toBe('10');
      expect(rows[1].contentLength).toBeNull();
    });

    it('retorna array vazio para entrada vazia', () => {
      expect(RabSyncStateMapper.toApiRows([])).toEqual([]);
    });
  });
});
