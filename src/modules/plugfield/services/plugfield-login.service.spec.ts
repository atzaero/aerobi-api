import { BadGatewayException } from '@nestjs/common';

import { PlugfieldHttpService } from './plugfield-http.service';
import { PlugfieldLoginService } from './plugfield-login.service';

describe('PlugfieldLoginService', () => {
  let service: PlugfieldLoginService;
  let requestJson: jest.Mock;

  beforeEach(() => {
    requestJson = jest.fn();
    const http = { requestJson } as unknown as PlugfieldHttpService;
    service = new PlugfieldLoginService(http);
  });

  it('returns object body from Plugfield', async () => {
    requestJson.mockResolvedValue({ access_token: 't' });

    const actual = await service.execute({
      username: 'u',
      password: 'p',
    });

    expect(actual).toEqual({ access_token: 't' });
    expect(requestJson).toHaveBeenCalledWith({
      method: 'POST',
      path: '/login',
      body: { username: 'u', password: 'p' },
      useVendorAuthorization: false,
    });
  });

  it('throws BadGatewayException when response is not an object', async () => {
    requestJson.mockResolvedValue(null);

    await expect(
      service.execute({ username: 'u', password: 'p' }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
