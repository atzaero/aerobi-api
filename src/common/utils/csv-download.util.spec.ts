import type { Response } from 'express';

import { applyCsvDownloadHeaders } from './csv-download.util';

describe('applyCsvDownloadHeaders', () => {
  let set: jest.Mock;
  let res: Response;

  beforeEach(() => {
    set = jest.fn();
    res = { set } as unknown as Response;
  });

  it('não truncado: seta Content-Type e Content-Disposition com o filename', () => {
    applyCsvDownloadHeaders(res, 'aerodromes.csv', {
      truncated: false,
      total: 3,
    });
    expect(set).toHaveBeenCalledWith({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="aerodromes.csv"',
    });
    expect(set).toHaveBeenCalledTimes(1);
  });

  it('truncado: adiciona X-Export-Truncated e X-Export-Total', () => {
    applyCsvDownloadHeaders(res, 'groups.csv', {
      truncated: true,
      total: 73000,
    });
    expect(set).toHaveBeenCalledTimes(2);
    expect(set).toHaveBeenLastCalledWith({
      'X-Export-Truncated': 'true',
      'X-Export-Total': '73000',
    });
  });
});
