import type { RabSyncStateService } from '../services/rab-sync-state.service';

import { SyncStateController } from './sync-state.controller';

describe('SyncStateController', () => {
  it('delega ao RabSyncStateService', async () => {
    const expected = [{ period: '2026-03', status: 'DONE' }];
    const execute = jest.fn().mockResolvedValue(expected);
    const service = { execute } as unknown as RabSyncStateService;
    const controller = new SyncStateController(service);

    const res = await controller.handle();

    expect(execute).toHaveBeenCalledWith();
    expect(res).toBe(expected);
  });
});
