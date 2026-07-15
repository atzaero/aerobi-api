import { ConfigService } from '@nestjs/config';

const FALLBACK_HTTP_PORT = 3333;

/**
 * Preferência ao `process.env.PORT` nativo (Docker Compose, hosting); fallback
 * ao `ConfigService` (.env carregado pelo Nest) e finalmente 3333.
 */
export function resolveHttpPort(configService: ConfigService): number {
  const rawPort =
    typeof process.env.PORT !== 'undefined' && process.env.PORT !== ''
      ? Number(process.env.PORT)
      : configService.get<number>('PORT');
  const port =
    typeof rawPort === 'number' && !Number.isNaN(rawPort)
      ? rawPort
      : FALLBACK_HTTP_PORT;
  return port;
}
