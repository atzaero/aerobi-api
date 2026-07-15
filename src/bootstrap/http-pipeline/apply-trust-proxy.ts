import type { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';

/** Um reverse-proxy (nginx) à frente da API. Ajuste via `TRUST_PROXY_HOPS`. */
const DEFAULT_TRUST_PROXY_HOPS = 1;

/**
 * Configura quantos proxies confiáveis estão à frente da aplicação (Express
 * `trust proxy`). Com isso `request.ip` reflete o IP real do cliente a partir
 * do `X-Forwarded-For` adicionado pelo proxy e ignora o header quando forjado
 * por um cliente conectado diretamente — base para rate-limit e auditoria por
 * IP não falsificáveis.
 *
 * Default `1` (um nginx na frente). Ajuste via `TRUST_PROXY_HOPS`: `2` atrás de
 * CDN + nginx, `0` se a API for exposta diretamente. Valor inválido cai no
 * default.
 */
export function applyTrustProxy(
  app: NestExpressApplication,
  configService: ConfigService,
): void {
  const raw = configService.get<string>('TRUST_PROXY_HOPS');
  const parsed = raw === undefined ? DEFAULT_TRUST_PROXY_HOPS : Number(raw);
  const hops =
    Number.isInteger(parsed) && parsed >= 0 ? parsed : DEFAULT_TRUST_PROXY_HOPS;
  app.set('trust proxy', hops);
}
