import type { ConfigService } from '@nestjs/config';

import type { CameraRepository } from '../repositories/camera.repository';
import type { CameraStreamSource } from '../types/camera-stream-source';

import { CameraQueryService } from './camera-query.service';

describe('CameraQueryService', () => {
  let findStreamSourceById: jest.Mock;
  let findEnabledStreamSourcesByIcao: jest.Mock;
  let service: CameraQueryService;

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

  const buildService = (ttlMs?: number): CameraQueryService => {
    const repo = {
      findStreamSourceById,
      findEnabledStreamSourcesByIcao,
    } as unknown as CameraRepository;
    const config = {
      get: jest.fn().mockReturnValue(ttlMs),
    } as unknown as ConfigService;
    return new CameraQueryService(repo, config);
  };

  beforeEach(() => {
    findStreamSourceById = jest.fn();
    findEnabledStreamSourcesByIcao = jest.fn();
    service = buildService(60_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findById (cacheado)', () => {
    it('faz cache: segunda chamada dentro do TTL não reconsulta o Postgres', async () => {
      findStreamSourceById.mockResolvedValue(source());

      const first = await service.findById('cam-1');
      const second = await service.findById('cam-1');

      expect(first).toEqual(source());
      expect(second).toEqual(source());
      expect(findStreamSourceById).toHaveBeenCalledTimes(1);
    });

    it('cacheia resultado negativo (null) para não martelar o Postgres', async () => {
      findStreamSourceById.mockResolvedValue(null);

      await service.findById('ghost');
      const again = await service.findById('ghost');

      expect(again).toBeNull();
      expect(findStreamSourceById).toHaveBeenCalledTimes(1);
    });

    it('deduplica leituras concorrentes do mesmo id (in-flight)', async () => {
      let resolveLookup: (value: CameraStreamSource) => void = () => undefined;
      findStreamSourceById.mockReturnValue(
        new Promise<CameraStreamSource>((resolve) => {
          resolveLookup = resolve;
        }),
      );

      const p1 = service.findById('cam-1');
      const p2 = service.findById('cam-1');
      resolveLookup(source());
      const [r1, r2] = await Promise.all([p1, p2]);

      expect(r1).toEqual(source());
      expect(r2).toEqual(source());
      expect(findStreamSourceById).toHaveBeenCalledTimes(1);
    });

    it('reconsulta após o TTL positivo expirar', async () => {
      findStreamSourceById.mockResolvedValue(source());
      const now = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);

      await service.findById('cam-1');
      now.mockReturnValue(1_000_000 + 60_001);
      await service.findById('cam-1');

      expect(findStreamSourceById).toHaveBeenCalledTimes(2);
    });

    it('resultado negativo expira no TTL curto (≤10s), não no TTL positivo', async () => {
      findStreamSourceById.mockResolvedValue(null);
      const now = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);

      await service.findById('ghost');
      /** Ainda dentro do TTL negativo (10s): usa cache. */
      now.mockReturnValue(1_000_000 + 9_000);
      await service.findById('ghost');
      expect(findStreamSourceById).toHaveBeenCalledTimes(1);

      /** Passou os 10s mas ainda dentro do TTL positivo (60s): reconsulta. */
      now.mockReturnValue(1_000_000 + 10_001);
      await service.findById('ghost');
      expect(findStreamSourceById).toHaveBeenCalledTimes(2);
    });

    it('câmera desativada é resolvida (enabled=false) — o proxy decide o 404', async () => {
      findStreamSourceById.mockResolvedValue(source({ enabled: false }));

      const out = await service.findById('cam-1');

      expect(out).toEqual(source({ enabled: false }));
    });
  });

  describe('invalidate', () => {
    it('invalidate(id) força nova consulta na próxima leitura', async () => {
      findStreamSourceById.mockResolvedValue(source());

      await service.findById('cam-1');
      service.invalidate('cam-1');
      await service.findById('cam-1');

      expect(findStreamSourceById).toHaveBeenCalledTimes(2);
    });

    it('invalidate() sem id limpa todo o cache', async () => {
      findStreamSourceById.mockResolvedValue(source());

      await service.findById('cam-1');
      await service.findById('cam-2');
      service.invalidate();
      await service.findById('cam-1');
      await service.findById('cam-2');

      expect(findStreamSourceById).toHaveBeenCalledTimes(4);
    });
  });

  describe('findEnabledByIcao (fresco)', () => {
    it('normaliza o ICAO para uppercase e não usa cache', async () => {
      findEnabledStreamSourcesByIcao.mockResolvedValue([source()]);

      const out = await service.findEnabledByIcao(' sbsp ');
      await service.findEnabledByIcao('SBSP');

      expect(out).toEqual([source()]);
      expect(findEnabledStreamSourcesByIcao).toHaveBeenCalledTimes(2);
      expect(findEnabledStreamSourcesByIcao).toHaveBeenNthCalledWith(1, 'SBSP');
      expect(findEnabledStreamSourcesByIcao).toHaveBeenNthCalledWith(2, 'SBSP');
    });
  });
});
