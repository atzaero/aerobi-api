import { Test, TestingModule } from '@nestjs/testing';

import { PilotLicenseResponseDto } from '../dtos/pilot-license-response.dto';
import { AnacCacheService } from './anac-cache.service';

function minimalPilotLicenseFixture(
  overrides: Partial<PilotLicenseResponseDto> = {},
): PilotLicenseResponseDto {
  const base: PilotLicenseResponseDto = {
    valido: true,
    possui_carteira: true,
    em_periodo_tolerancia: false,
    dados: {},
    ...overrides,
  };
  return base;
}

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
    const data = minimalPilotLicenseFixture({ validade: '01/01/2099' });
    service.setCache('key1', data);
    expect(service.getCache('key1')).toEqual(data);
  });

  it('retorna null para chave expirada', () => {
    jest.useFakeTimers();
    try {
      service.setCache('key1', minimalPilotLicenseFixture());
      // TTL 5 min no serviço — avança tempo sem 301s reais na CI
      jest.advanceTimersByTime(5 * 60 * 1000 + 1);
      expect(service.getCache('key1')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it('sobrescreve dados existentes', () => {
    service.setCache('key1', minimalPilotLicenseFixture({ valido: false }));
    service.setCache('key1', minimalPilotLicenseFixture({ valido: true }));
    expect(service.getCache('key1')).toEqual(
      minimalPilotLicenseFixture({ valido: true }),
    );
  });

  it('trata chaves diferentes independentemente', () => {
    service.setCache(
      'key1',
      minimalPilotLicenseFixture({ dias_para_vencimento: 10 }),
    );
    service.setCache(
      'key2',
      minimalPilotLicenseFixture({ dias_para_vencimento: 20 }),
    );
    expect(service.getCache('key1')).toEqual(
      minimalPilotLicenseFixture({ dias_para_vencimento: 10 }),
    );
    expect(service.getCache('key2')).toEqual(
      minimalPilotLicenseFixture({ dias_para_vencimento: 20 }),
    );
  });
});
