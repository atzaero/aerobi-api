import { BadGatewayException } from '@nestjs/common';

import { PlugfieldHttpService } from './plugfield-http.service';
import { PlugfieldDataSensorService } from './plugfield-data-sensor.service';

describe('PlugfieldDataSensorService', () => {
  let service: PlugfieldDataSensorService;
  let requestJson: jest.Mock;

  beforeEach(() => {
    requestJson = jest.fn();
    const http = { requestJson } as unknown as PlugfieldHttpService;
    service = new PlugfieldDataSensorService(http);
  });

  it('sends correct query params to Plugfield', async () => {
    requestJson.mockResolvedValue({ data: [] });

    await service.execute({
      device: 9133,
      sensor: 8,
      time: 1000,
      timeMax: 2000,
      groupedBy: 'day',
    });

    expect(requestJson).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/data/sensor',
        query: {
          device: 9133,
          sensor: 8,
          time: 1000,
          timeMax: 2000,
          groupedBy: 'day',
        },
      }),
    );
  });

  it('omits optional params when not provided', async () => {
    requestJson.mockResolvedValue({ data: [] });

    await service.execute({ device: 9133, sensor: 8 });

    expect(requestJson).toHaveBeenCalledWith(
      expect.objectContaining({
        query: {
          device: 9133,
          sensor: 8,
          time: undefined,
          timeMax: undefined,
          groupedBy: undefined,
        },
      }),
    );
  });

  it('throws BadGatewayException on null response', async () => {
    requestJson.mockResolvedValue(null);

    await expect(
      service.execute({ device: 9133, sensor: 8 }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
