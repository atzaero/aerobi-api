import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW_MS = 60_000;

/**
 * Rate limiter em memória por IP (janela deslizante fixa). Adequado para rotas
 * públicas com proteção básica; em produção complementar com nginx/ingress.
 */
@Injectable()
export class InMemoryIpRateLimiterService {
  private readonly buckets = new Map<
    string,
    { count: number; resetTime: number }
  >();

  constructor(private readonly errorMessageService: ErrorMessageService) {}

  /**
   * Incrementa o contador do IP e lança 429 quando o limite da janela é atingido.
   */
  assertWithinLimit(
    ip: string,
    options: { limit?: number; windowMs?: number } = {},
  ): void {
    const limit = options.limit ?? DEFAULT_LIMIT;
    const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
    const now = Date.now();
    const record = this.buckets.get(ip);

    if (!record || now > record.resetTime) {
      this.buckets.set(ip, { count: 1, resetTime: now + windowMs });
      return;
    }

    if (record.count >= limit) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.VALIDATION_FAILED, {
          DETAILS: 'Muitas requisições. Tente novamente em alguns minutos.',
        }),
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.VALIDATION_FAILED,
      );
    }

    record.count += 1;
  }
}
