import type { CameraStreamResponseDTO } from '../dtos/camera-stream-response.dto';
import type { ListAerodromeCameraStreamsService } from '../services/list-aerodrome-camera-streams.service';

import { ListAerodromeCameraStreamsController } from './list-aerodrome-camera-streams.controller';

describe('ListAerodromeCameraStreamsController', () => {
  let execute: jest.Mock;
  let controller: ListAerodromeCameraStreamsController;

  beforeEach(() => {
    execute = jest.fn();
    const service = {
      execute,
    } as unknown as ListAerodromeCameraStreamsService;
    controller = new ListAerodromeCameraStreamsController(service);
  });

  it('delega o ICAO do param ao service e devolve a lista', async () => {
    const rows: CameraStreamResponseDTO[] = [
      {
        id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
        name: 'Pátio',
        icao: 'SBSP',
        streamUrl:
          '/camera-streams/3f2504e0-4f89-41d3-9a0c-0305e82c3301/index.m3u8',
      },
    ];
    execute.mockResolvedValue(rows);

    const out = await controller.handle({ icao: 'SBSP' });

    expect(execute).toHaveBeenCalledWith('SBSP');
    expect(out).toBe(rows);
  });
});
