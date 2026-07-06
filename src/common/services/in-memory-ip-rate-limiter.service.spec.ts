import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { InMemoryIpRateLimiterService } from '@/common/services/in-memory-ip-rate-limiter.service';

describe('InMemoryIpRateLimiterService', () => {
  let service: InMemoryIpRateLimiterService;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    service = new InMemoryIpRateLimiterService({
      getMessage: jest.fn((code: string) => code),
    } as unknown as ErrorMessageService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('permite até o limite padrão por IP', () => {
    for (let i = 0; i < 10; i += 1) {
      expect(() => service.assertWithinLimit('203.0.113.1')).not.toThrow();
    }
  });

  it('bloqueia após exceder o limite', () => {
    for (let i = 0; i < 10; i += 1) {
      service.assertWithinLimit('203.0.113.1');
    }

    expect(() => service.assertWithinLimit('203.0.113.1')).toThrow(
      CustomHttpException,
    );

    try {
      service.assertWithinLimit('203.0.113.1');
    } catch (err) {
      expect(err).toBeInstanceOf(CustomHttpException);
      const ex = err as CustomHttpException;
      expect(ex.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(ex.getErrorCode()).toBe(ErrorCode.VALIDATION_FAILED);
    }
  });

  it('reseta o contador após a janela expirar', () => {
    for (let i = 0; i < 10; i += 1) {
      service.assertWithinLimit('203.0.113.1');
    }
    expect(() => service.assertWithinLimit('203.0.113.1')).toThrow(
      CustomHttpException,
    );

    jest.advanceTimersByTime(60_001);

    expect(() => service.assertWithinLimit('203.0.113.1')).not.toThrow();
  });

  it('remove buckets expirados no sweep (não cresce sem limite)', () => {
    for (let i = 0; i < 50; i += 1) {
      service.assertWithinLimit(`10.0.0.${i}`);
    }
    expect(service.size).toBe(50);

    jest.advanceTimersByTime(60_001);
    service.assertWithinLimit('203.0.113.99');

    expect(service.size).toBe(1);
  });
});
