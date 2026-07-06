import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';

import { InMemoryIpRateLimiterService } from '@/common/services/in-memory-ip-rate-limiter.service';
import { extractIpAddress } from '@/common/utils/extract-ip-address.util';

/**
 * Rate limit básico por IP para rotas públicas de manutenção (`/public/maintenances`).
 */
@Injectable()
export class PublicMaintenanceRateLimitGuard implements CanActivate {
  constructor(private readonly rateLimiter: InMemoryIpRateLimiterService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = extractIpAddress(request) ?? 'unknown';
    this.rateLimiter.assertWithinLimit(ip);
    return true;
  }
}
