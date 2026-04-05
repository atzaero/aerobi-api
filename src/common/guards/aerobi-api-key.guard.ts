import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import { Request } from 'express';

/**
 * Guard HTTP para rotas protegidas da Aerobi (`/rab/*`, `/private-aerodromes/*`, `/plugfield/*`):
 * exige header **`X-API-Key`** igual a **`AEROBI_API_KEY`** quando a autenticação está ativa.
 *
 * ## Bypass em `development`
 *
 * - Se `NODE_ENV` é **`development`** e **`AEROBI_REQUIRE_AUTH`** não é truthy, o pedido
 *   passa **sem** `X-API-Key` (DX local).
 * - Para forçar validação em dev: `AEROBI_REQUIRE_AUTH=true` (`true`, `1`, `yes`).
 *
 * ## Produção / auth forçada
 *
 * - `AEROBI_API_KEY` tem de estar definida; caso contrário **401** (chave não configurada).
 * - Cliente deve enviar `X-API-Key` com o mesmo valor; comparação em tempo constante.
 *
 * ## Nota
 *
 * Jobs internos (ex. cron) que chamam services diretamente **não** passam por este guard.
 */
@Injectable()
export class AerobiApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(AerobiApiKeyGuard.name);

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.shouldBypassAuth()) {
      return true;
    }

    const expected =
      this.config.get<string>('AEROBI_API_KEY', '')?.trim() ?? '';
    if (expected.length === 0) {
      this.logger.warn('AEROBI_API_KEY is not set; rejecting HTTP request');
      throw new UnauthorizedException(
        'Aerobi API key not configured on server (AEROBI_API_KEY)',
      );
    }

    const req = context.switchToHttp().getRequest<Request>();
    const raw = req.headers['x-api-key'];
    const provided = typeof raw === 'string' ? raw.trim() : '';

    if (!this.constantTimeEqual(provided, expected)) {
      throw new UnauthorizedException('Missing or invalid X-API-Key');
    }

    return true;
  }

  private constantTimeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) {
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  }

  /**
   * `true` quando não devemos exigir `X-API-Key`.
   * `AEROBI_REQUIRE_AUTH` truthy → **nunca** bypass por ambiente.
   */
  private shouldBypassAuth(): boolean {
    if (this.isRequireAuthEnforced()) {
      return false;
    }
    const nodeEnv = this.config.get<string>('NODE_ENV', 'development');
    const bypass = nodeEnv === 'development';
    if (bypass) {
      this.logger.debug(
        'Aerobi API key bypass: NODE_ENV=development (set AEROBI_REQUIRE_AUTH=true to enforce X-API-Key)',
      );
    }
    return bypass;
  }

  private isRequireAuthEnforced(): boolean {
    const raw = this.config.get<string>('AEROBI_REQUIRE_AUTH', '');
    const v = raw.trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes';
  }
}
