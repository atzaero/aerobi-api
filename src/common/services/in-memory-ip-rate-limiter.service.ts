import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW_MS = 60_000;
/** Intervalo mínimo entre varreduras de entradas expiradas (amortiza o O(n)). */
const SWEEP_INTERVAL_MS = 60_000;

/**
 * Rate limiter em memória por IP (janela fixa). Adequado para rotas públicas
 * com proteção básica; em produção complementar com nginx/ingress. Requer que
 * `trust proxy` esteja configurado (ver `applyTrustProxy`) para que o IP usado
 * como chave seja o do cliente real, não um X-Forwarded-For forjado.
 */
@Injectable()
export class InMemoryIpRateLimiterService {
  private readonly buckets = new Map<
    string,
    { count: number; resetTime: number }
  >();

  /** Próximo instante (ms) a partir do qual uma varredura de expirados é permitida. */
  private nextSweepAt = 0;

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

    this.sweepExpired(now);

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

  /** Quantidade de buckets vivos (introspecção para testes/observabilidade). */
  get size(): number {
    return this.buckets.size;
  }

  /**
   * Remove buckets já expirados, no máximo uma vez por `SWEEP_INTERVAL_MS`. Sem
   * isto o `Map` cresceria sem limite: o caminho normal só sobrescreve a entrada
   * do próprio IP, nunca as de IPs que não voltam (ou de X-Forwarded-For
   * distintos), abrindo um vetor de exaustão de memória.
   */
  private sweepExpired(now: number): void {
    if (now < this.nextSweepAt) return;
    this.nextSweepAt = now + SWEEP_INTERVAL_MS;
    for (const [key, record] of this.buckets) {
      if (now > record.resetTime) {
        this.buckets.delete(key);
      }
    }
  }
}
