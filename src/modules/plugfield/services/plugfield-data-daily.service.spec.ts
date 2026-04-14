import { BadGatewayException } from '@nestjs/common';

import { PlugfieldHttpService } from './plugfield-http.service';
import { PlugfieldDataDailyService } from './plugfield-data-daily.service';

describe('PlugfieldDataDailyService', () => {
  let service: PlugfieldDataDailyService;
  let requestJson: jest.Mock;

  beforeEach(() => {
    requestJson = jest.fn();
    const http = { requestJson } as unknown as PlugfieldHttpService;
    service = new PlugfieldDataDailyService(http);
  });

  it('sends device, begin, end to Plugfield', async () => {
    requestJson.mockResolvedValue([{ id: 1 }]);

    const actual = await service.execute({
      device: 9133,
      begin: '01/04/2026',
      end: '14/04/2026',
    });

    expect(actual).toEqual([{ id: 1 }]);
    expect(requestJson).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/data/daily',
        query: {
          device: 9133,
          begin: '01/04/2026',
          end: '14/04/2026',
        },
      }),
    );
  });

  it('throws BadGatewayException on null response', async () => {
    requestJson.mockResolvedValue(null);

    await expect(
      service.execute({
        device: 9133,
        begin: '01/04/2026',
        end: '14/04/2026',
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
