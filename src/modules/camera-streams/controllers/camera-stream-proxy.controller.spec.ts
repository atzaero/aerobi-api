import type { Request, Response } from 'express';

import type { HlsProxyService } from '../services/hls-proxy.service';

import { CameraStreamProxyController } from './camera-stream-proxy.controller';

const CAMERA_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';

/** Request mínimo com a URL desejada (o controller só lê `originalUrl`/`url`). */
function reqWith(url: string): Request {
  return { originalUrl: url, url } as Request;
}

describe('CameraStreamProxyController', () => {
  let proxyHls: jest.Mock;
  let controller: CameraStreamProxyController;
  const res = {} as Response;

  beforeEach(() => {
    proxyHls = jest.fn().mockResolvedValue(undefined);
    const proxy = { proxyHls } as unknown as HlsProxyService;
    controller = new CameraStreamProxyController(proxy);
  });

  it('playlist delega o path fixo index.m3u8 (sem query)', async () => {
    await controller.playlist(
      { cameraId: CAMERA_ID },
      reqWith(`/camera-streams/${CAMERA_ID}/index.m3u8`),
      res,
    );
    expect(proxyHls).toHaveBeenCalledWith(CAMERA_ID, 'index.m3u8', res, '');
  });

  it('playlist repassa a query string verbatim (blocking reload LL-HLS)', async () => {
    await controller.playlist(
      { cameraId: CAMERA_ID },
      reqWith(`/camera-streams/${CAMERA_ID}/index.m3u8?_HLS_msn=5&_HLS_part=2`),
      res,
    );
    expect(proxyHls).toHaveBeenCalledWith(
      CAMERA_ID,
      'index.m3u8',
      res,
      '?_HLS_msn=5&_HLS_part=2',
    );
  });

  it('segment delega o nome do segmento recebido', async () => {
    await controller.segment(
      { cameraId: CAMERA_ID, segment: 'seg7.m4s' },
      reqWith(`/camera-streams/${CAMERA_ID}/seg7.m4s`),
      res,
    );
    expect(proxyHls).toHaveBeenCalledWith(CAMERA_ID, 'seg7.m4s', res, '');
  });
});
