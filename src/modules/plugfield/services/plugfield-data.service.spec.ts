import { BadGatewayException, BadRequestException } from '@nestjs/common';

import { PlugfieldHttpService } from './plugfield-http.service';
import { PlugfieldDataService } from './plugfield-data.service';

describe('PlugfieldDataService', () => {
  let service: PlugfieldDataService;
  let requestJson: jest.Mock;

  beforeEach(() => {
    requestJson = jest.fn();
    const http = { requestJson } as unknown as PlugfieldHttpService;
    service = new PlugfieldDataService(http);
  });

  it('throws BadRequestException when sensorId and deviceId are missing', async () => {
    await expect(service.getDaily({}, undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('calls daily endpoint with trimmed sensorId', async () => {
    requestJson.mockResolvedValue({ a: 1 });

    const actual = await service.getDaily(
      { sensorId: ' s1 ', startTime: 1, endTime: 2 },
      undefined,
    );

    expect(actual).toEqual({ a: 1 });
    expect(requestJson).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/data/daily',
        query: {
          sensorId: 's1',
          deviceId: undefined,
          startTime: 1,
          endTime: 2,
        },
      }),
    );
  });

  it('throws BadGatewayException on invalid data shape', async () => {
    requestJson.mockResolvedValue('string');

    await expect(
      service.getSensor({ deviceId: 'd' }, undefined),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('accepts array response from hourly', async () => {
    requestJson.mockResolvedValue([1, 2]);

    const actual = await service.getHourly({ deviceId: 'd' }, undefined);

    expect(actual).toEqual([1, 2]);
  });
});
