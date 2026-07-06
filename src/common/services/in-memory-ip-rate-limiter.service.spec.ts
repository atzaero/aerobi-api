import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { InMemoryIpRateLimiterService } from '@/common/services/in-memory-ip-rate-limiter.service';

describe('InMemoryIpRateLimiterService', () => {
  let service: InMemoryIpRateLimiterService;

  beforeEach(() => {
    service = new InMemoryIpRateLimiterService({
      getMessage: jest.fn((code: string) => code),
    } as unknown as ErrorMessageService);
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
});
