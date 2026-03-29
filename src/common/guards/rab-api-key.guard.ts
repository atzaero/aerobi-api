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
 * Guard HTTP para todas as rotas **`/rab/*`**: exige header **`X-API-Key`** igual a
 * **`RAB_SYNC_API_KEY`** quando a autenticação está ativa.
 *
 * ## Bypass em `development`
 *
 * - Se `NODE_ENV` é **`development`** e **`RAB_SYNC_REQUIRE_AUTH`** não é truthy, o pedido
 *   passa **sem** `X-API-Key` (DX local).
 * - Para forçar validação em dev: `RAB_SYNC_REQUIRE_AUTH=true` (`true`, `1`, `yes`).
 *
 * ## Produção / auth forçada
 *
 * - `RAB_SYNC_API_KEY` tem de estar definida; caso contrário **401** (chave não configurada).
 * - Cliente deve enviar `X-API-Key` com o mesmo valor; comparação em tempo constante.
 *
 * ## Nota
 *
 * Jobs internos (cron) que chamam `RabSyncService` diretamente **não** passam por este guard.
 */
@Injectable()
export class RabApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(RabApiKeyGuard.name);

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.shouldBypassAuth()) {
      return true;
    }

    const expected =
      this.config.get<string>('RAB_SYNC_API_KEY', '')?.trim() ?? '';
    if (expected.length === 0) {
      this.logger.warn(
        'RAB_SYNC_API_KEY is not set; rejecting RAB HTTP request',
      );
      throw new UnauthorizedException(
        'RAB API key not configured on server (RAB_SYNC_API_KEY)',
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
   * `RAB_SYNC_REQUIRE_AUTH` truthy → **nunca** bypass por ambiente.
   */
  private shouldBypassAuth(): boolean {
    if (this.isRequireAuthEnforced()) {
      return false;
    }
    const nodeEnv = this.config.get<string>('NODE_ENV', 'development');
    const bypass = nodeEnv === 'development';
    if (bypass) {
      this.logger.debug(
        'RAB auth bypass: NODE_ENV=development (set RAB_SYNC_REQUIRE_AUTH=true to enforce X-API-Key)',
      );
    }
    return bypass;
  }

  private isRequireAuthEnforced(): boolean {
    const raw = this.config.get<string>('RAB_SYNC_REQUIRE_AUTH', '');
    const v = raw.trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes';
  }
}
