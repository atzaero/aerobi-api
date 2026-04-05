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

  it('throws BadGatewayException on invalid shape', async () => {
    requestJson.mockResolvedValue('string');

    await expect(service.execute({ deviceId: 'd' })).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });

  it('uses sensor path on execute', async () => {
    requestJson.mockResolvedValue({ ok: true });

    await service.execute({ sensorId: 's' });

    expect(requestJson).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/data/sensor',
      }),
    );
  });
});
