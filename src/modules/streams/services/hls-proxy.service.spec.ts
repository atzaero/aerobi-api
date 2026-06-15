import { HttpService } from '@nestjs/axios';
import { HttpStatus } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import type { Readable } from 'node:stream';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { ErrorMessageService } from '@/common/error-messages/error-message.service';

import type { CameraResolverService } from './camera-resolver.service';
import type { Camera } from '../types/camera';

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

describe('HlsProxyService', () => {
  let resolve: jest.Mock;
  let get: jest.Mock;
  let service: HlsProxyService;

  const camera = (over: Partial<Camera> = {}): Camera => ({
    id: 'cam-1',
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

  /** Executa proxyHls esperando rejeição e devolve a exceção capturada. */
  const expectReject = async (
    cameraId: string,
    path: string,
    res: Response,
  ): Promise<CustomHttpException> => {
    const error = await service.proxyHls(cameraId, path, res).then(
      () => {
        throw new Error('esperava rejeição, mas resolveu');
      },
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(CustomHttpException);
    return error as CustomHttpException;
  };

  beforeEach(() => {
    resolve = jest.fn();
    get = jest.fn();
    const http = { axiosRef: { get } } as unknown as HttpService;
    const resolver = { resolve } as unknown as CameraResolverService;
    const errorMessage = {
      getMessage: jest.fn().mockReturnValue('erro'),
    } as unknown as ErrorMessageService;
    const config = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;
    service = new HlsProxyService(http, resolver, errorMessage, config);
  });

  it('câmera inexistente → 404 e não chama o mediamtx', async () => {
    resolve.mockResolvedValue(null);

    const error = await expectReject('ghost', 'index.m3u8', fakeRes().res);

    expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(get).not.toHaveBeenCalled();
  });

  it('câmera desativada → 404', async () => {
    resolve.mockResolvedValue(camera({ enabled: false }));

    const error = await expectReject('cam-1', 'index.m3u8', fakeRes().res);

    expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(get).not.toHaveBeenCalled();
  });

  it('erro ao resolver no Firestore → 502 (não 500) e não chama o mediamtx', async () => {
    resolve.mockRejectedValue(new Error('firestore down'));

    const error = await expectReject('cam-1', 'index.m3u8', fakeRes().res);

    expect(error.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
    expect(get).not.toHaveBeenCalled();
  });

  it('playlist .m3u8: monta a URL, define headers e faz pipe', async () => {
    resolve.mockResolvedValue(camera());
    const upstream = fakeStream();
    get.mockResolvedValue({ status: 200, data: upstream.stream, headers: {} });
    const res = fakeRes();

    await service.proxyHls('cam-1', 'index.m3u8', res.res);

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

  it('segmento .m4s: content-type de segmento e cache curto', async () => {
    resolve.mockResolvedValue(camera());
    get.mockResolvedValue({
      status: 200,
      data: fakeStream().stream,
      headers: {},
    });
    const res = fakeRes();

    await service.proxyHls('cam-1', 'seg7.m4s', res.res);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'video/iso.segment',
    );
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'max-age=10');
  });

  it('segmento .mp4 (ex.: init.mp4): video/mp4', async () => {
    resolve.mockResolvedValue(camera());
    get.mockResolvedValue({
      status: 200,
      data: fakeStream().stream,
      headers: {},
    });
    const res = fakeRes();

    await service.proxyHls('cam-1', 'init.mp4', res.res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'video/mp4');
  });

  it('mediamtx responde 404 → 404 e destrói o stream upstream', async () => {
    resolve.mockResolvedValue(camera());
    const upstream = fakeStream();
    get.mockResolvedValue({ status: 404, data: upstream.stream, headers: {} });

    const error = await expectReject('cam-1', 'index.m3u8', fakeRes().res);

    expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(upstream.destroy).toHaveBeenCalled();
  });

  it('mediamtx responde 500 → 502', async () => {
    resolve.mockResolvedValue(camera());
    get.mockResolvedValue({
      status: 500,
      data: fakeStream().stream,
      headers: {},
    });

    const error = await expectReject('cam-1', 'index.m3u8', fakeRes().res);

    expect(error.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
  });

  it('mediamtx inacessível (axios lança) → 502', async () => {
    resolve.mockResolvedValue(camera());
    get.mockRejectedValue(new Error('ECONNREFUSED'));

    const error = await expectReject('cam-1', 'index.m3u8', fakeRes().res);

    expect(error.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
  });
});
