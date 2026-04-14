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

  it('sends page query param to Plugfield', async () => {
    requestJson.mockResolvedValue([{ id: '1' }]);

    await service.execute({ page: 2 });

    expect(requestJson).toHaveBeenCalledWith(
      expect.objectContaining({
        query: { page: 2 },
      }),
    );
  });

  it('defaults page to 1 when not provided', async () => {
    requestJson.mockResolvedValue([{ id: '1' }]);

    await service.execute({});

    expect(requestJson).toHaveBeenCalledWith(
      expect.objectContaining({
        query: { page: 1 },
      }),
    );
  });

  it('normalizes array response on execute', async () => {
    requestJson.mockResolvedValue([{ id: '1' }]);

    const actual = await service.execute({ page: 1 });

    expect(actual).toEqual([{ id: '1' }]);
  });

  it('normalizes wrapped data array on execute', async () => {
    requestJson.mockResolvedValue({ data: [{ id: '1' }] });

    const actual = await service.execute({ page: 1 });

    expect(actual).toEqual([{ id: '1' }]);
  });

  it('normalizes wrapped deviceList array on execute', async () => {
    requestJson.mockResolvedValue({
      pagination: { currentPage: 1, totalPages: 1 },
      deviceList: [{ id: '1' }],
    });

    const actual = await service.execute({ page: 1 });

    expect(actual).toEqual([{ id: '1' }]);
  });

  it('returns empty array when response has no recognizable list shape', async () => {
    requestJson.mockResolvedValue({ notList: true });

    const actual = await service.execute({ page: 1 });

    expect(actual).toEqual([]);
  });
});
