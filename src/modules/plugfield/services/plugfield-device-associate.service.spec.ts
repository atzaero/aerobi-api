import { BadRequestException } from '@nestjs/common';

import { PlugfieldHttpService } from './plugfield-http.service';
import { PlugfieldDeviceAssociateService } from './plugfield-device-associate.service';

describe('PlugfieldDeviceAssociateService', () => {
  let service: PlugfieldDeviceAssociateService;
  let requestJson: jest.Mock;

  beforeEach(() => {
    requestJson = jest.fn();
    const http = { requestJson } as unknown as PlugfieldHttpService;
    service = new PlugfieldDeviceAssociateService(http);
  });

  it('throws BadRequestException when neither deviceId nor code', async () => {
    await expect(service.execute({}, undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('posts deviceId when execute receives deviceId', async () => {
    requestJson.mockResolvedValue({ ok: true });

    await service.execute({ deviceId: ' d1 ' }, undefined);

    expect(requestJson).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/device',
        body: { deviceId: 'd1' },
      }),
    );
  });
});
