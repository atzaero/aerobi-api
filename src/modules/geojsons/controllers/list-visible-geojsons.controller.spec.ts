import type { ListVisibleGeojsonsService } from '../services/list-visible-geojsons.service';

import { ListVisibleGeojsonsController } from './list-visible-geojsons.controller';

describe('ListVisibleGeojsonsController', () => {
  let controller: ListVisibleGeojsonsController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListVisibleGeojsonsController({
      execute,
    } as unknown as ListVisibleGeojsonsService);
  });

  it('delega ao service', async () => {
    const rows = [{ docId: 'a-1' }];
    execute.mockResolvedValue(rows);
    await expect(controller.handle()).resolves.toBe(rows);
    expect(execute).toHaveBeenCalledWith();
  });
});
