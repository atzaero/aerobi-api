import type { CameraStreamSource } from '@/modules/cameras/types/camera-stream-source';

import { CameraStreamMapper } from './camera-stream.mapper';

describe('CameraStreamMapper', () => {
  const source: CameraStreamSource = {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    icao: 'SBSP',
    name: 'Pátio',
    mediamtxNode: 'aerobi-edge-mvp',
    mediamtxPath: 'aero-mvp-cam-1',
    enabled: true,
  };

  it('deriva a streamUrl deste proxy e expõe só id/name/icao/streamUrl', () => {
    const out = CameraStreamMapper.toResponse(source);

    expect(out).toEqual({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      name: 'Pátio',
      icao: 'SBSP',
      streamUrl:
        '/camera-streams/3f2504e0-4f89-41d3-9a0c-0305e82c3301/index.m3u8',
    });
  });

  it('não vaza mediamtxNode/mediamtxPath (topologia da tailnet)', () => {
    const out = CameraStreamMapper.toResponse(source);

    expect(out).not.toHaveProperty('mediamtxNode');
    expect(out).not.toHaveProperty('mediamtxPath');
  });
});
