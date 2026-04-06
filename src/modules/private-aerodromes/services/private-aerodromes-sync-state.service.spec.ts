import type { PrivateAerodromesSyncState } from '@/generated/prisma/client';
import { PrivateAerodromesSyncStatus } from '@/generated/prisma/client';

import { PrivateAerodromesSyncStateRepository } from '../repositories/private-aerodromes-sync-state.repository';

import { PrivateAerodromesSyncStateService } from './private-aerodromes-sync-state.service';

function mockSyncState(
  overrides: Partial<PrivateAerodromesSyncState> = {},
): PrivateAerodromesSyncState {
  return {
    id: 'state-1',
    datasetKey: 'private_aerodromes',
    sourceUrl: 'https://example.com/aerodromes.csv',
    datasetVersion: '2024-01-15',
    lastModified: 'Wed, 15 Jan 2024 00:00:00 GMT',
    contentLength: BigInt(1024),
    contentHash: 'abc123',
    parsedRowCount: 500,
    syncedAt: new Date('2024-01-15T12:00:00Z'),
    status: PrivateAerodromesSyncStatus.SUCCESS,
    errorMessage: null,
    ...overrides,
  };
}

describe('PrivateAerodromesSyncStateService', () => {
  let service: PrivateAerodromesSyncStateService;
  let findManyOrderBySyncedAtDesc: jest.Mock;

  beforeEach(() => {
    findManyOrderBySyncedAtDesc = jest.fn().mockResolvedValue([]);
    const repo = {
      findManyOrderBySyncedAtDesc,
    } as unknown as PrivateAerodromesSyncStateRepository;
    service = new PrivateAerodromesSyncStateService(repo);
  });

  describe('success', () => {
    it('retorna rows mapeados com contentLength serializado como string', async () => {
      const state = mockSyncState({ contentLength: BigInt(2048) });
      findManyOrderBySyncedAtDesc.mockResolvedValue([state]);

      const result = await service.execute();

      expect(result).toHaveLength(1);
      expect(result[0].contentLength).toBe('2048');
      expect(result[0].datasetKey).toBe('private_aerodromes');
      expect(findManyOrderBySyncedAtDesc).toHaveBeenCalledTimes(1);
    });

    it('retorna array vazio quando repositório retorna []', async () => {
      findManyOrderBySyncedAtDesc.mockResolvedValue([]);

      const result = await service.execute();

      expect(result).toEqual([]);
    });

    it('serializa contentLength null como null no mapeamento', async () => {
      const state = mockSyncState({ contentLength: null });
      findManyOrderBySyncedAtDesc.mockResolvedValue([state]);

      const result = await service.execute();

      expect(result[0].contentLength).toBeNull();
    });
  });

  describe('erros', () => {
    it('propaga erro do repositório', async () => {
      findManyOrderBySyncedAtDesc.mockRejectedValue(
        new Error('db unavailable'),
      );

      await expect(service.execute()).rejects.toThrow('db unavailable');
    });
  });
});
