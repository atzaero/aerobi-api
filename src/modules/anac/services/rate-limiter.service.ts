import { Injectable } from '@nestjs/common';

@Injectable()
export class RateLimiterService {
  private readonly rateLimitMap = new Map<
    string,
    { count: number; resetTime: number }
  >();
  private readonly RATE_LIMIT = 10; // 10 requisições por IP por minuto
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto em ms

  checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW,
      });
      return true;
    }

    if (record.count >= this.RATE_LIMIT) {
      return false;
    }

    record.count++;
    return true;
  }
}
