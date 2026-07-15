import type { AnacIndexService } from '../services/anac-index.service';

import { LatestPeriodController } from './latest-period.controller';

describe('LatestPeriodController', () => {
  it('devolve o período resolvido pelo AnacIndexService', async () => {
    const execute = jest.fn().mockResolvedValue('2026-03');
    const index = { execute } as unknown as AnacIndexService;
    const controller = new LatestPeriodController(index);

    const res = await controller.handle();

    expect(execute).toHaveBeenCalledWith();
    expect(res).toEqual({ period: '2026-03' });
  });
});
