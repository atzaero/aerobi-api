import { PlugfieldHttpService } from './plugfield-http.service';
import { PlugfieldDeviceByIdService } from './plugfield-device-by-id.service';

describe('PlugfieldDeviceByIdService', () => {
  let service: PlugfieldDeviceByIdService;
  let requestJson: jest.Mock;

  beforeEach(() => {
    requestJson = jest.fn();
    const http = { requestJson } as unknown as PlugfieldHttpService;
    service = new PlugfieldDeviceByIdService(http);
  });

  it('returns object on execute', async () => {
    requestJson.mockResolvedValue({ id: 'x' });

    const actual = await service.execute('x');

    expect(actual).toEqual({ id: 'x' });
    expect(requestJson).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/device/x',
      }),
    );
  });
});
