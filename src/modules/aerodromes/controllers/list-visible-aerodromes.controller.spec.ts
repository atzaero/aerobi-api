import type { ListVisibleAerodromesService } from '../services/list-visible-aerodromes.service';

import { ListVisibleAerodromesController } from './list-visible-aerodromes.controller';

describe('ListVisibleAerodromesController', () => {
  let controller: ListVisibleAerodromesController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListVisibleAerodromesController({
      execute,
    } as unknown as ListVisibleAerodromesService);
  });

  it('delega ao service', async () => {
    const rows = [{ id: 'a-1' }];
    execute.mockResolvedValue(rows);
    await expect(controller.handle()).resolves.toBe(rows);
    expect(execute).toHaveBeenCalledWith();
  });
});
