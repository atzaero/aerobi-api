import { BadGatewayException, BadRequestException } from '@nestjs/common';

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

  it('throws BadRequestException when sensorId and deviceId are missing', async () => {
    await expect(service.execute({}, undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('calls daily endpoint with trimmed sensorId on execute', async () => {
    requestJson.mockResolvedValue({ a: 1 });

    const actual = await service.execute(
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
      service.execute({ deviceId: 'd' }, undefined),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
