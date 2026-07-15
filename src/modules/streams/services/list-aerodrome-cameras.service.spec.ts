import { HttpStatus } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { ErrorMessageService } from '@/common/error-messages/error-message.service';

import type { CameraRepository } from '../repositories/camera.repository';
import type { Camera } from '../types/camera';

import { ListAerodromeCamerasService } from './list-aerodrome-cameras.service';

describe('ListAerodromeCamerasService', () => {
  let findEnabledByIcao: jest.Mock;
  let service: ListAerodromeCamerasService;

  const camera = (over: Partial<Camera> = {}): Camera => ({
    id: 'cam-1',
    icao: 'SBSP',
    name: 'Pátio',
    mediamtxNode: 'aerobi-edge-mvp',
    mediamtxPath: 'aero-mvp-cam-1',
    enabled: true,
    ...over,
  });

  beforeEach(() => {
    findEnabledByIcao = jest.fn();
    const repo = { findEnabledByIcao } as unknown as CameraRepository;
    const errorMessage = {
      getMessage: jest.fn().mockReturnValue('erro'),
    } as unknown as ErrorMessageService;
    service = new ListAerodromeCamerasService(repo, errorMessage);
  });

  it('projeta câmeras para a resposta pública (sem vazar node/path)', async () => {
    findEnabledByIcao.mockResolvedValue([camera()]);

    const result = await service.execute('SBSP');

    expect(result).toEqual([
      {
        id: 'cam-1',
        name: 'Pátio',
        icao: 'SBSP',
        streamUrl: '/streams/cam-1/index.m3u8',
      },
    ]);
    expect(result[0]).not.toHaveProperty('mediamtxNode');
    expect(result[0]).not.toHaveProperty('mediamtxPath');
  });

  it('delega o ICAO ao repositório e devolve [] quando vazio', async () => {
    findEnabledByIcao.mockResolvedValue([]);

    const result = await service.execute('sbsp');

    expect(findEnabledByIcao).toHaveBeenCalledWith('sbsp');
    expect(result).toEqual([]);
  });

  it('converte falha do Firestore em 502 (EXTERNAL_SERVICE_FAILED)', async () => {
    findEnabledByIcao.mockRejectedValue(new Error('firestore down'));

    const error = await service.execute('SBSP').then(
      () => {
        throw new Error('esperava rejeição');
      },
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(CustomHttpException);
    expect((error as CustomHttpException).getStatus()).toBe(
      HttpStatus.BAD_GATEWAY,
    );
  });
});
