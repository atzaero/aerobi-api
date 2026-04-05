import { PlugfieldHttpService } from './plugfield-http.service';
import { PlugfieldDataHourlyService } from './plugfield-data-hourly.service';

describe('PlugfieldDataHourlyService', () => {
  let service: PlugfieldDataHourlyService;
  let requestJson: jest.Mock;

  beforeEach(() => {
    requestJson = jest.fn();
    const http = { requestJson } as unknown as PlugfieldHttpService;
    service = new PlugfieldDataHourlyService(http);
  });

  it('accepts array response on execute', async () => {
    requestJson.mockResolvedValue([1, 2]);

    const actual = await service.execute({ deviceId: 'd' }, undefined);

    expect(actual).toEqual([1, 2]);
    expect(requestJson).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/data/hourly',
      }),
    );
  });
});
