import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';

/**
 * CORS:
 *  - dev: origem permissiva (`true`) para evitar atrito com hot reload
 *  - prod: lista explícita de `CORS_ORIGINS` (separada por vírgula)
 *
 * O header `X-API-Key` continua permitido — `AerobiApiKeyGuard` o usa.
 * `Authorization` é necessário para o JWT do módulo `auth`.
 */
export function applyCors(
  app: NestExpressApplication,
  configService: ConfigService,
  isDevelopment: boolean,
): void {
  const corsOrigins = configService
    .get<string>('CORS_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  const options: CorsOptions = {
    origin: isDevelopment ? true : corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
    ],
    credentials: true,
  };

  app.enableCors(options);
}
