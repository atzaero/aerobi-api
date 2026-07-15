import type { SyncRabDto } from '../dtos/sync-rab.dto';
import type { RabSyncService } from '../services/rab-sync.service';
import type { SyncResult } from '../types/sync-result.type';

import { SyncController } from './sync.controller';

describe('SyncController', () => {
  it('delega ao RabSyncService com o body recebido', async () => {
    const expected = { period: '2026-03' } as unknown as SyncResult;
    const execute = jest.fn().mockResolvedValue(expected);
    const rabSync = { execute } as unknown as RabSyncService;
    const controller = new SyncController(rabSync);
    const body: SyncRabDto = { period: '2026-03', force: true };

    const res = await controller.handle(body);

    expect(execute).toHaveBeenCalledWith(body);
    expect(res).toBe(expected);
  });
});
