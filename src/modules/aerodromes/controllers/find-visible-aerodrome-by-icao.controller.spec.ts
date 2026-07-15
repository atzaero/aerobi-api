import type { FindVisibleAerodromeByIcaoService } from '../services/find-visible-aerodrome-by-icao.service';

import { FindVisibleAerodromeByIcaoController } from './find-visible-aerodrome-by-icao.controller';

describe('FindVisibleAerodromeByIcaoController', () => {
  let controller: FindVisibleAerodromeByIcaoController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindVisibleAerodromeByIcaoController({
      execute,
    } as unknown as FindVisibleAerodromeByIcaoService);
  });

  it('delega o ICAO do param', async () => {
    const row = { id: 'a-1', icao: 'SJ4E' };
    execute.mockResolvedValue(row);
    await expect(controller.handle({ icao: 'sj4e' })).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({ icao: 'sj4e' });
  });
});
