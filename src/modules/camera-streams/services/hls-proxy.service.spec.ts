import { HttpService } from '@nestjs/axios';
import { HttpStatus } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import type { Readable } from 'node:stream';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { ErrorMessageService } from '@/common/error-messages/error-message.service';
import type { CameraQueryService } from '@/modules/cameras/services/camera-query.service';
import type { CameraStreamSource } from '@/modules/cameras/types/camera-stream-source';

import { HlsProxyService } from './hls-proxy.service';

interface FakeStream {
  stream: Readable;
  pipe: jest.Mock;
  destroy: jest.Mock;
}

interface FakeRes {
  res: Response;
  status: jest.Mock;
  setHeader: jest.Mock;
}

const CAMERA_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';

describe('HlsProxyService (camera-streams v2)', () => {
  let findById: jest.Mock;
  let get: jest.Mock;
  let service: HlsProxyService;

  const camera = (
    over: Partial<CameraStreamSource> = {},
  ): CameraStreamSource => ({
    id: CAMERA_ID,
    icao: 'SBSP',
    name: 'Pátio',
    mediamtxNode: 'aerobi-edge-mvp',
    mediamtxPath: 'aero-mvp-cam-1',
    enabled: true,
    ...over,
  });

  const fakeStream = (): FakeStream => {
    const pipe = jest.fn();
    const destroy = jest.fn();
    const stream = { pipe, destroy, on: jest.fn() } as unknown as Readable;
    return { stream, pipe, destroy };
  };

  const fakeRes = (): FakeRes => {
    const status = jest.fn();
    const setHeader = jest.fn();
    const res = {
      status: status.mockReturnThis(),
      setHeader,
      on: jest.fn(),
      destroy: jest.fn(),
    } as unknown as Response;
    return { res, status, setHeader };
  };

  /** Executa proxyHls esperando rejeição e devolve o erro capturado. */
  const reject = async (
    cameraId: string,
    path: string,
    res: Response,
  ): Promise<unknown> =>
    service.proxyHls(cameraId, path, res).then(
      () => {
        throw new Error('esperava rejeição, mas resolveu');
      },
      (e: unknown) => e,
    );

  const expectHttp = async (
    cameraId: string,
    path: string,
    res: Response,
  ): Promise<CustomHttpException> => {
    const error = await reject(cameraId, path, res);
    expect(error).toBeInstanceOf(CustomHttpException);
    return error as CustomHttpException;
  };

  beforeEach(() => {
    findById = jest.fn();
    get = jest.fn();
    const http = { axiosRef: { get } } as unknown as HttpService;
    const cameraQuery = { findById } as unknown as CameraQueryService;
    const errorMessage = {
      getMessage: jest.fn().mockReturnValue('erro'),
    } as unknown as ErrorMessageService;
    const config = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;
    service = new HlsProxyService(http, cameraQuery, errorMessage, config);
  });

  it('câmera inexistente → 404 e não chama o mediamtx', async () => {
    findById.mockResolvedValue(null);

    const error = await expectHttp(CAMERA_ID, 'index.m3u8', fakeRes().res);

    expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(get).not.toHaveBeenCalled();
  });

  it('câmera desativada → 404', async () => {
    findById.mockResolvedValue(camera({ enabled: false }));

    const error = await expectHttp(CAMERA_ID, 'index.m3u8', fakeRes().res);

    expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(get).not.toHaveBeenCalled();
  });

  it('erro ao ler o Postgres PROPAGA (500 genérico, não 502) e não chama o mediamtx', async () => {
    const dbError = new Error('db down');
    findById.mockRejectedValue(dbError);

    const error = await reject(CAMERA_ID, 'index.m3u8', fakeRes().res);

    /** Postgres é dependência interna → não vira 502; o filtro global responde 500. */
    expect(error).toBe(dbError);
    expect(error).not.toBeInstanceOf(CustomHttpException);
    expect(get).not.toHaveBeenCalled();
  });

  it('mediamtxNode inválido (SSRF) → 404 e não chama o mediamtx', async () => {
    findById.mockResolvedValue(camera({ mediamtxNode: 'evil/host:9000' }));

    const error = await expectHttp(CAMERA_ID, 'index.m3u8', fakeRes().res);

    expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(get).not.toHaveBeenCalled();
  });

  it('mediamtxPath com traversal → 404 e não chama o mediamtx', async () => {
    findById.mockResolvedValue(camera({ mediamtxPath: '../../etc' }));

    const error = await expectHttp(CAMERA_ID, 'index.m3u8', fakeRes().res);

    expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(get).not.toHaveBeenCalled();
  });

  it('playlist .m3u8: monta a URL (uuid), define headers e faz pipe', async () => {
    findById.mockResolvedValue(camera());
    const upstream = fakeStream();
    get.mockResolvedValue({ status: 200, data: upstream.stream, headers: {} });
    const res = fakeRes();

    await service.proxyHls(CAMERA_ID, 'index.m3u8', res.res);

    expect(get).toHaveBeenCalledWith(
      'http://aerobi-edge-mvp:8888/aero-mvp-cam-1/index.m3u8',
      expect.objectContaining({ responseType: 'stream' }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/vnd.apple.mpegurl',
    );
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(upstream.pipe).toHaveBeenCalledWith(res.res);
  });

  it('repassa a query string (blocking reload LL-HLS) na URL upstream', async () => {
    findById.mockResolvedValue(camera());
    get.mockResolvedValue({
      status: 200,
      data: fakeStream().stream,
      headers: {},
    });

    await service.proxyHls(
      CAMERA_ID,
      'video1_stream.m3u8',
      fakeRes().res,
      '?_HLS_msn=5&_HLS_part=2',
    );

    expect(get).toHaveBeenCalledWith(
      'http://aerobi-edge-mvp:8888/aero-mvp-cam-1/video1_stream.m3u8?_HLS_msn=5&_HLS_part=2',
      expect.objectContaining({ responseType: 'stream' }),
    );
  });

  it('segmento .m4s: content-type de segmento e cache curto', async () => {
    findById.mockResolvedValue(camera());
    get.mockResolvedValue({
      status: 200,
      data: fakeStream().stream,
      headers: {},
    });
    const res = fakeRes();

    await service.proxyHls(CAMERA_ID, 'seg7.m4s', res.res);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'video/iso.segment',
    );
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'max-age=10');
  });

  it('segmento .mp4 (ex.: init.mp4): video/mp4', async () => {
    findById.mockResolvedValue(camera());
    get.mockResolvedValue({
      status: 200,
      data: fakeStream().stream,
      headers: {},
    });
    const res = fakeRes();

    await service.proxyHls(CAMERA_ID, 'init.mp4', res.res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'video/mp4');
  });

  it('mediamtx responde 404 → 404 e destrói o stream upstream', async () => {
    findById.mockResolvedValue(camera());
    const upstream = fakeStream();
    get.mockResolvedValue({ status: 404, data: upstream.stream, headers: {} });

    const error = await expectHttp(CAMERA_ID, 'index.m3u8', fakeRes().res);

    expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(upstream.destroy).toHaveBeenCalled();
  });

  it('mediamtx responde 500 → 502', async () => {
    findById.mockResolvedValue(camera());
    get.mockResolvedValue({
      status: 500,
      data: fakeStream().stream,
      headers: {},
    });

    const error = await expectHttp(CAMERA_ID, 'index.m3u8', fakeRes().res);

    expect(error.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
  });

  it('mediamtx inacessível (axios lança) → 502', async () => {
    findById.mockResolvedValue(camera());
    get.mockRejectedValue(new Error('ECONNREFUSED'));

    const error = await expectHttp(CAMERA_ID, 'index.m3u8', fakeRes().res);

    expect(error.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
  });
});
