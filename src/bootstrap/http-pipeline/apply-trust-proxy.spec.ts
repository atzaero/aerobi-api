import type { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { applyTrustProxy } from './apply-trust-proxy';

function build(raw?: string): {
  app: NestExpressApplication;
  configService: ConfigService;
  set: jest.Mock;
} {
  const set = jest.fn();
  const app = { set } as unknown as NestExpressApplication;
  const configService = {
    get: jest.fn(() => raw),
  } as unknown as ConfigService;
  return { app, configService, set };
}

describe('applyTrustProxy', () => {
  it('usa 1 hop por padrão (um nginx na frente)', () => {
    const { app, configService, set } = build(undefined);
    applyTrustProxy(app, configService);
    expect(set).toHaveBeenCalledWith('trust proxy', 1);
  });

  it('respeita TRUST_PROXY_HOPS', () => {
    const { app, configService, set } = build('2');
    applyTrustProxy(app, configService);
    expect(set).toHaveBeenCalledWith('trust proxy', 2);
  });

  it('aceita 0 (API exposta diretamente)', () => {
    const { app, configService, set } = build('0');
    applyTrustProxy(app, configService);
    expect(set).toHaveBeenCalledWith('trust proxy', 0);
  });

  it('cai no default para valor inválido', () => {
    const { app, configService, set } = build('não-número');
    applyTrustProxy(app, configService);
    expect(set).toHaveBeenCalledWith('trust proxy', 1);
  });
});
