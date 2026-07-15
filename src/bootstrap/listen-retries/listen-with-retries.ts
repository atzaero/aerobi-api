import type { NestExpressApplication } from '@nestjs/platform-express';

import { clampListenRetryAttempts } from './clamp-listen-retry-attempts';
import { clampListenRetryDelayMs } from './clamp-listen-retry-delay-ms';
import { LISTEN_RETRY_MAX_DELAY_MS } from './constants';
import { getListenErrnoCode } from './get-listen-errno-code';

/**
 * Liga `app.listen(port)` repetindo apenas em erro `EADDRINUSE` (ex.: ciclo
 * anterior do watcher dev ainda a liberar a porta). Em qualquer outro erro,
 * relança de imediato.
 */
export async function listenWithRetries(
  app: NestExpressApplication,
  port: number,
): Promise<void> {
  const maxAttempts = clampListenRetryAttempts(
    Number(process.env.LISTEN_RETRY_MAX),
  );
  const baseDelayMs = clampListenRetryDelayMs(
    Number(process.env.LISTEN_RETRY_DELAY_MS),
  );

  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await app.listen(port);
      return;
    } catch (err) {
      lastErr = err;
      const code = getListenErrnoCode(err);
      const isBusy = code === 'EADDRINUSE';
      if (!isBusy || attempt === maxAttempts - 1) {
        throw err;
      }
      const backoff = Math.min(
        baseDelayMs * 1.5 ** attempt,
        LISTEN_RETRY_MAX_DELAY_MS,
      );
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
  throw new Error(
    'listenWithRetries exited without resolving (unexpected control flow)',
    { cause: lastErr },
  );
}
