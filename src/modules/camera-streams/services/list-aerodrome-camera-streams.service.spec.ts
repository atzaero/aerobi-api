import type { CameraQueryService } from '@/modules/cameras/services/camera-query.service';
import type { CameraStreamSource } from '@/modules/cameras/types/camera-stream-source';

import { ListAerodromeCameraStreamsService } from './list-aerodrome-camera-streams.service';

describe('ListAerodromeCameraStreamsService', () => {
  let findEnabledByIcao: jest.Mock;
  let service: ListAerodromeCameraStreamsService;

  const source = (
    over: Partial<CameraStreamSource> = {},
  ): CameraStreamSource => ({
    id: '11111111-1111-4111-8111-111111111111',
    icao: 'SBSP',
    name: 'Pátio',
    mediamtxNode: 'aerobi-edge-mvp',
    mediamtxPath: 'aero-mvp-cam-1',
    enabled: true,
    ...over,
  });

  beforeEach(() => {
    findEnabledByIcao = jest.fn();
    const cameraQuery = { findEnabledByIcao } as unknown as CameraQueryService;
    service = new ListAerodromeCameraStreamsService(cameraQuery);
  });

  it('projeta cada câmera na resposta pública (id/name/icao/streamUrl), sem topologia', async () => {
    findEnabledByIcao.mockResolvedValue([source()]);

    const out = await service.execute('SBSP');

    expect(findEnabledByIcao).toHaveBeenCalledWith('SBSP');
    expect(out).toEqual([
      {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Pátio',
        icao: 'SBSP',
        streamUrl:
          '/camera-streams/11111111-1111-4111-8111-111111111111/index.m3u8',
      },
    ]);
    /** Nunca vaza mediamtxNode/mediamtxPath. */
    expect(JSON.stringify(out)).not.toContain('mediamtx');
  });

  it('aeródromo sem câmeras publicáveis → lista vazia', async () => {
    findEnabledByIcao.mockResolvedValue([]);

    await expect(service.execute('SBSP')).resolves.toEqual([]);
  });
});
