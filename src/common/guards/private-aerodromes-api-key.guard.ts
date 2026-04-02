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

@Injectable()
export class PrivateAerodromesApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(PrivateAerodromesApiKeyGuard.name);

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.shouldBypassAuth()) {
      return true;
    }

    const expected =
      this.config.get<string>('PRIVATE_AERODROMES_SYNC_API_KEY', '')?.trim() ??
      '';
    if (expected.length === 0) {
      this.logger.warn(
        'PRIVATE_AERODROMES_SYNC_API_KEY is not set; rejecting HTTP request',
      );
      throw new UnauthorizedException(
        'Private aerodromes API key not configured on server (PRIVATE_AERODROMES_SYNC_API_KEY)',
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
        'Private aerodromes auth bypass: NODE_ENV=development (set PRIVATE_AERODROMES_SYNC_REQUIRE_AUTH=true to enforce X-API-Key)',
      );
    }
    return bypass;
  }

  private isRequireAuthEnforced(): boolean {
    const raw = this.config.get<string>(
      'PRIVATE_AERODROMES_SYNC_REQUIRE_AUTH',
      '',
    );
    const v = raw.trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes';
  }
}
