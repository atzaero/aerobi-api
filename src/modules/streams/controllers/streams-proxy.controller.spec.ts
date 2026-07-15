import type { Request, Response } from 'express';

import type { HlsProxyService } from '../services/hls-proxy.service';

import { StreamsProxyController } from './streams-proxy.controller';

/** Request mínimo com a URL desejada (o controller só lê `originalUrl`/`url`). */
function reqWith(url: string): Request {
  return { originalUrl: url, url } as Request;
}

describe('StreamsProxyController', () => {
  let proxyHls: jest.Mock;
  let controller: StreamsProxyController;
  const res = {} as Response;

  beforeEach(() => {
    proxyHls = jest.fn().mockResolvedValue(undefined);
    const proxy = { proxyHls } as unknown as HlsProxyService;
    controller = new StreamsProxyController(proxy);
  });

  it('playlist delega o path fixo index.m3u8 (sem query)', async () => {
    await controller.playlist(
      { cameraId: 'cam-1' },
      reqWith('/streams/cam-1/index.m3u8'),
      res,
    );
    expect(proxyHls).toHaveBeenCalledWith('cam-1', 'index.m3u8', res, '');
  });

  it('playlist repassa a query string verbatim (blocking reload LL-HLS)', async () => {
    await controller.playlist(
      { cameraId: 'cam-1' },
      reqWith('/streams/cam-1/index.m3u8?_HLS_msn=5&_HLS_part=2'),
      res,
    );
    expect(proxyHls).toHaveBeenCalledWith(
      'cam-1',
      'index.m3u8',
      res,
      '?_HLS_msn=5&_HLS_part=2',
    );
  });

  it('segment delega o nome do segmento recebido', async () => {
    await controller.segment(
      { cameraId: 'cam-1', segment: 'seg7.m4s' },
      reqWith('/streams/cam-1/seg7.m4s'),
      res,
    );
    expect(proxyHls).toHaveBeenCalledWith('cam-1', 'seg7.m4s', res, '');
  });
});
