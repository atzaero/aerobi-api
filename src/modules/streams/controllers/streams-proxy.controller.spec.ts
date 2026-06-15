import type { Response } from 'express';

import type { HlsProxyService } from '../services/hls-proxy.service';

import { StreamsProxyController } from './streams-proxy.controller';

describe('StreamsProxyController', () => {
  let proxyHls: jest.Mock;
  let controller: StreamsProxyController;
  const res = {} as Response;

  beforeEach(() => {
    proxyHls = jest.fn().mockResolvedValue(undefined);
    const proxy = { proxyHls } as unknown as HlsProxyService;
    controller = new StreamsProxyController(proxy);
  });

  it('playlist delega o path fixo index.m3u8', async () => {
    await controller.playlist({ cameraId: 'cam-1' }, res);
    expect(proxyHls).toHaveBeenCalledWith('cam-1', 'index.m3u8', res);
  });

  it('segment delega o nome do segmento recebido', async () => {
    await controller.segment({ cameraId: 'cam-1', segment: 'seg7.m4s' }, res);
    expect(proxyHls).toHaveBeenCalledWith('cam-1', 'seg7.m4s', res);
  });
});
