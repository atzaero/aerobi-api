import type { NestExpressApplication } from '@nestjs/platform-express';

import { listenWithRetries } from './listen-with-retries';

/** Cria um erro de listen com o `code` errno informado. */
function listenError(code: string): NodeJS.ErrnoException {
  return Object.assign(new Error(`listen ${code}`), { code });
}

/** App mínimo com apenas o `listen` mockado (o que a função usa). */
function appWith(listen: jest.Mock): NestExpressApplication {
  return { listen } as unknown as NestExpressApplication;
}

describe('listenWithRetries', () => {
  const envBackup = { ...process.env };

  afterEach(() => {
    process.env = { ...envBackup };
    jest.useRealTimers();
  });

  it('resolve na primeira tentativa quando a porta está livre', async () => {
    const listen = jest.fn().mockResolvedValueOnce(undefined);
    await listenWithRetries(appWith(listen), 3333);
    expect(listen).toHaveBeenCalledTimes(1);
    expect(listen).toHaveBeenCalledWith(3333);
  });

  it('retenta em EADDRINUSE e resolve quando a porta libera', async () => {
    jest.useFakeTimers();
    const listen = jest
      .fn()
      .mockRejectedValueOnce(listenError('EADDRINUSE'))
      .mockRejectedValueOnce(listenError('EADDRINUSE'))
      .mockResolvedValueOnce(undefined);

    const promise = listenWithRetries(appWith(listen), 3333);
    await jest.runAllTimersAsync();
    await expect(promise).resolves.toBeUndefined();
    expect(listen).toHaveBeenCalledTimes(3);
  });

  it('relança imediatamente um erro não-EADDRINUSE (ex.: EACCES)', async () => {
    const listen = jest.fn().mockRejectedValueOnce(listenError('EACCES'));
    await expect(listenWithRetries(appWith(listen), 3333)).rejects.toThrow(
      'EACCES',
    );
    expect(listen).toHaveBeenCalledTimes(1);
  });

  it('relança EADDRINUSE após esgotar as tentativas', async () => {
    process.env.LISTEN_RETRY_MAX = '2';
    jest.useFakeTimers();
    const listen = jest.fn().mockRejectedValue(listenError('EADDRINUSE'));

    const promise = listenWithRetries(appWith(listen), 3333);
    const assertion = expect(promise).rejects.toThrow('EADDRINUSE');
    await jest.runAllTimersAsync();
    await assertion;
    expect(listen).toHaveBeenCalledTimes(2);
  });
});
