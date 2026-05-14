import type { NestExpressApplication } from '@nestjs/platform-express';

/** Encadeia SIGTERM/SIGINT ao ciclo Nest (`onApplicationShutdown`). */
export function applyShutdownHooks(app: NestExpressApplication): void {
  app.enableShutdownHooks();
}
