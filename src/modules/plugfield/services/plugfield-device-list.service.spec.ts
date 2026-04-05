import { PlugfieldHttpService } from './plugfield-http.service';
import { PlugfieldDeviceListService } from './plugfield-device-list.service';

describe('PlugfieldDeviceListService', () => {
  let service: PlugfieldDeviceListService;
  let requestJson: jest.Mock;

  beforeEach(() => {
    requestJson = jest.fn();
    const http = { requestJson } as unknown as PlugfieldHttpService;
    service = new PlugfieldDeviceListService(http);
  });

  it('normalizes array response on execute', async () => {
    requestJson.mockResolvedValue([{ id: '1' }]);

    const actual = await service.execute({}, undefined);

    expect(actual).toEqual([{ id: '1' }]);
  });

  it('normalizes wrapped data array on execute', async () => {
    requestJson.mockResolvedValue({ data: [{ id: '1' }] });

    const actual = await service.execute({}, undefined);

    expect(actual).toEqual([{ id: '1' }]);
  });

  it('returns empty array when response has no recognizable list shape', async () => {
    requestJson.mockResolvedValue({ notList: true });

    const actual = await service.execute({}, undefined);

    expect(actual).toEqual([]);
  });
});
