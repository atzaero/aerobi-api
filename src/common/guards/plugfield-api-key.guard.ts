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
 * Guard HTTP para rotas **`/plugfield/*`**: exige header **`X-API-Key`** igual a
 * **`PLUGFIELD_SYNC_API_KEY`** quando a autenticação está ativa.
 *
 * ## Bypass em `development`
 *
 * - Se `NODE_ENV` é **`development`** e **`PLUGFIELD_SYNC_REQUIRE_AUTH`** não é truthy, o pedido
 *   passa **sem** `X-API-Key` (DX local).
 * - Para forçar validação em dev: `PLUGFIELD_SYNC_REQUIRE_AUTH=true` (`true`, `1`, `yes`).
 *
 * ## Produção / auth forçada
 *
 * - `PLUGFIELD_SYNC_API_KEY` tem de estar definida; caso contrário **401**.
 * - Cliente deve enviar `X-API-Key` com o mesmo valor; comparação em tempo constante.
 *
 * **Nota:** Este guard protege o **proxy** Aerobi. A chave enviada à Plugfield (`x-api-key` vendor)
 * é separada: `PLUGFIELD_VENDOR_API_KEY` (ver `PlugfieldHttpService`).
 */
@Injectable()
export class PlugfieldApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(PlugfieldApiKeyGuard.name);

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.shouldBypassAuth()) {
      return true;
    }

    const expected =
      this.config.get<string>('PLUGFIELD_SYNC_API_KEY', '')?.trim() ?? '';
    if (expected.length === 0) {
      this.logger.warn(
        'PLUGFIELD_SYNC_API_KEY is not set; rejecting Plugfield HTTP request',
      );
      throw new UnauthorizedException(
        'Plugfield API key not configured on server (PLUGFIELD_SYNC_API_KEY)',
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

  private shouldBypassAuth(): boolean {
    if (this.isRequireAuthEnforced()) {
      return false;
    }
    const nodeEnv = this.config.get<string>('NODE_ENV', 'development');
    const bypass = nodeEnv === 'development';
    if (bypass) {
      this.logger.debug(
        'Plugfield auth bypass: NODE_ENV=development (set PLUGFIELD_SYNC_REQUIRE_AUTH=true to enforce X-API-Key)',
      );
    }
    return bypass;
  }

  private isRequireAuthEnforced(): boolean {
    const raw = this.config.get<string>('PLUGFIELD_SYNC_REQUIRE_AUTH', '');
    const v = raw.trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes';
  }
}
