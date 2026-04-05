import { BadRequestException } from '@nestjs/common';

import { PlugfieldHttpService } from './plugfield-http.service';
import { PlugfieldDeviceService } from './plugfield-device.service';

describe('PlugfieldDeviceService', () => {
  let service: PlugfieldDeviceService;
  let requestJson: jest.Mock;

  beforeEach(() => {
    requestJson = jest.fn();
    const http = { requestJson } as unknown as PlugfieldHttpService;
    service = new PlugfieldDeviceService(http);
  });

  it('normalizes array response for listDevices', async () => {
    requestJson.mockResolvedValue([{ id: '1' }]);

    const actual = await service.listDevices({}, undefined);

    expect(actual).toEqual([{ id: '1' }]);
  });

  it('normalizes wrapped data array for listDevices', async () => {
    requestJson.mockResolvedValue({ data: [{ id: '1' }] });

    const actual = await service.listDevices({}, undefined);

    expect(actual).toEqual([{ id: '1' }]);
  });

  it('returns empty array when response has no recognizable list shape', async () => {
    requestJson.mockResolvedValue({ notList: true });

    const actual = await service.listDevices({}, undefined);

    expect(actual).toEqual([]);
  });

  it('throws BadRequestException when associate has neither deviceId nor code', async () => {
    await expect(service.associateDevice({}, undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('posts deviceId when associate has deviceId', async () => {
    requestJson.mockResolvedValue({ ok: true });

    await service.associateDevice({ deviceId: ' d1 ' }, undefined);

    expect(requestJson).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/device',
        body: { deviceId: 'd1' },
      }),
    );
  });

  it('returns object for getDeviceById', async () => {
    requestJson.mockResolvedValue({ id: 'x' });

    const actual = await service.getDeviceById('x', undefined);

    expect(actual).toEqual({ id: 'x' });
    expect(requestJson).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/device/x',
      }),
    );
  });
});
