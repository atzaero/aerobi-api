import { Test, TestingModule } from '@nestjs/testing';
import { AnacCacheService } from './anac-cache.service';

describe('AnacCacheService', () => {
  let service: AnacCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnacCacheService],
    }).compile();

    service = module.get<AnacCacheService>(AnacCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('retorna null para chave inexistente', () => {
    expect(service.getCache('non-existent')).toBeNull();
  });

  it('salva e recupera dados corretamente', () => {
    const data = { test: 'value' };
    service.setCache('key1', data);
    expect(service.getCache('key1')).toEqual(data);
  });

  it('retorna null para chave expirada', () => {
    jest.useFakeTimers();
    try {
      service.setCache('key1', { test: 'value' });
      // TTL 5 min no serviço — avança tempo sem 301s reais na CI
      jest.advanceTimersByTime(5 * 60 * 1000 + 1);
      expect(service.getCache('key1')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it('sobrescreve dados existentes', () => {
    service.setCache('key1', { test: 'value1' });
    service.setCache('key1', { test: 'value2' });
    expect(service.getCache('key1')).toEqual({ test: 'value2' });
  });

  it('trata chaves diferentes independentemente', () => {
    service.setCache('key1', { test: 'value1' });
    service.setCache('key2', { test: 'value2' });
    expect(service.getCache('key1')).toEqual({ test: 'value1' });
    expect(service.getCache('key2')).toEqual({ test: 'value2' });
  });
});
