import type { ConfigService } from '@nestjs/config';

import type { CameraRepository } from '../repositories/camera.repository';
import type { Camera } from '../types/camera';

import { CameraResolverService } from './camera-resolver.service';

describe('CameraResolverService', () => {
  let findById: jest.Mock;
  let service: CameraResolverService;

  const camera = (over: Partial<Camera> = {}): Camera => ({
    id: 'cam-1',
    icao: 'SBSP',
    name: 'Pátio',
    mediamtxNode: 'aerobi-edge-mvp',
    mediamtxPath: 'aero-mvp-cam-1',
    enabled: true,
    ...over,
  });

  const buildService = (ttlMs?: number): CameraResolverService => {
    const repo = { findById } as unknown as CameraRepository;
    const config = {
      get: jest.fn().mockReturnValue(ttlMs),
    } as unknown as ConfigService;
    return new CameraResolverService(repo, config);
  };

  beforeEach(() => {
    findById = jest.fn();
    service = buildService(60_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('faz cache: segunda chamada dentro do TTL não reconsulta o Firestore', async () => {
    findById.mockResolvedValue(camera());

    const first = await service.resolve('cam-1');
    const second = await service.resolve('cam-1');

    expect(first).toEqual(camera());
    expect(second).toEqual(camera());
    expect(findById).toHaveBeenCalledTimes(1);
  });

  it('cacheia resultado negativo (null) para não martelar o Firestore', async () => {
    findById.mockResolvedValue(null);

    await service.resolve('ghost');
    const again = await service.resolve('ghost');

    expect(again).toBeNull();
    expect(findById).toHaveBeenCalledTimes(1);
  });

  it('deduplica leituras concorrentes do mesmo id (in-flight)', async () => {
    let resolveLookup: (value: Camera) => void = () => undefined;
    findById.mockReturnValue(
      new Promise<Camera>((resolve) => {
        resolveLookup = resolve;
      }),
    );

    const p1 = service.resolve('cam-1');
    const p2 = service.resolve('cam-1');
    resolveLookup(camera());
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toEqual(camera());
    expect(r2).toEqual(camera());
    expect(findById).toHaveBeenCalledTimes(1);
  });

  it('reconsulta após o TTL expirar', async () => {
    findById.mockResolvedValue(camera());
    const now = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);

    await service.resolve('cam-1');
    now.mockReturnValue(1_000_000 + 60_001);
    await service.resolve('cam-1');

    expect(findById).toHaveBeenCalledTimes(2);
  });

  it('invalidate(id) força nova consulta na próxima leitura', async () => {
    findById.mockResolvedValue(camera());

    await service.resolve('cam-1');
    service.invalidate('cam-1');
    await service.resolve('cam-1');

    expect(findById).toHaveBeenCalledTimes(2);
  });
});
