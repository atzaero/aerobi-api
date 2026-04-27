import { Test, TestingModule } from '@nestjs/testing';
import { RateLimiterService } from './rate-limiter.service';

describe('RateLimiterService', () => {
  let service: RateLimiterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RateLimiterService],
    }).compile();

    service = module.get<RateLimiterService>(RateLimiterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('permite primeira requisição de um IP', () => {
    expect(service.checkRateLimit('127.0.0.1')).toBe(true);
  });

  it('permite requisições dentro do limite', () => {
    const ip = '127.0.0.1';
    for (let i = 0; i < 10; i++) {
      expect(service.checkRateLimit(ip)).toBe(true);
    }
  });

  it('bloqueia requisições acima do limite', () => {
    const ip = '127.0.0.1';
    for (let i = 0; i < 10; i++) {
      service.checkRateLimit(ip);
    }
    expect(service.checkRateLimit(ip)).toBe(false);
  });

  it('reseta o contador após o tempo limite', async () => {
    const ip = '127.0.0.1';
    for (let i = 0; i < 10; i++) {
      service.checkRateLimit(ip);
    }
    expect(service.checkRateLimit(ip)).toBe(false);

    // Aguarda 61 segundos (mais que o window de 60s)
    await new Promise(resolve => setTimeout(resolve, 61000));

    expect(service.checkRateLimit(ip)).toBe(true);
  });

  it('trata IPs diferentes independentemente', () => {
    const ip1 = '127.0.0.1';
    const ip2 = '192.168.1.1';

    for (let i = 0; i < 10; i++) {
      service.checkRateLimit(ip1);
    }
    expect(service.checkRateLimit(ip1)).toBe(false);
    expect(service.checkRateLimit(ip2)).toBe(true);
  });
});
