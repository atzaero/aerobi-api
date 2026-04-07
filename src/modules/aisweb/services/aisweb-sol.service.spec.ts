import { Test, TestingModule } from '@nestjs/testing';

import { SolQueryDto } from '../dtos/sol-query.dto';
import { AiswebHttpService } from './aisweb-http.service';
import { AiswebSolService } from './aisweb-sol.service';

const mockParsedSingleDay = {
  aisweb: {
    day: {
      date: '2026-04-06',
      sunrise: '0908',
      sunset: '2112',
      weekDay: '1',
      aero: 'SBGR',
    },
  },
};

const mockParsedMultipleDays = {
  aisweb: {
    day: [
      {
        date: '2026-04-06',
        sunrise: '0908',
        sunset: '2112',
        weekDay: '1',
        aero: 'SBGR',
        geo: '-23.43/-46.47',
      },
      {
        date: '2026-04-07',
        sunrise: '0909',
        sunset: '2111',
        weekDay: '2',
        aero: 'SBGR',
      },
    ],
  },
};

describe('AiswebSolService', () => {
  let service: AiswebSolService;
  let aiswebHttp: jest.Mocked<Pick<AiswebHttpService, 'executeXmlQuery'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiswebSolService,
        {
          provide: AiswebHttpService,
          useValue: { executeXmlQuery: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AiswebSolService);
    aiswebHttp = module.get(AiswebHttpService);
  });

  it('chama executeXmlQuery com area "sol" e datas fornecidas', async () => {
    aiswebHttp.executeXmlQuery.mockResolvedValue(mockParsedSingleDay);
    const query: SolQueryDto = {
      icaoCode: 'SBGR',
      dt_i: '2026-04-06',
      dt_f: '2026-04-07',
    };
    await service.execute(query);
    expect(aiswebHttp.executeXmlQuery).toHaveBeenCalledWith('sol', {
      icaoCode: 'SBGR',
      dt_i: '2026-04-06',
      dt_f: '2026-04-07',
    });
  });

  it('usa a data de hoje como padrão quando dt_i e dt_f não são informados', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-06T15:30:00.000Z'));
    try {
      aiswebHttp.executeXmlQuery.mockResolvedValue(mockParsedSingleDay);
      await service.execute({ icaoCode: 'SBGR' });
      expect(aiswebHttp.executeXmlQuery).toHaveBeenCalledWith('sol', {
        icaoCode: 'SBGR',
        dt_i: '2026-04-06',
        dt_f: '2026-04-06',
      });
    } finally {
      jest.useRealTimers();
    }
  });

  it('retorna um dia normalizado para resposta com um único <day>', async () => {
    aiswebHttp.executeXmlQuery.mockResolvedValue(mockParsedSingleDay);
    const result = await service.execute({ icaoCode: 'SBGR' });
    expect(result.days).toHaveLength(1);
    expect(result.days[0]).toEqual({
      date: '2026-04-06',
      sunrise: '0908',
      sunset: '2112',
      weekDay: 1,
      aero: 'SBGR',
      geo: undefined,
    });
  });

  it('retorna múltiplos dias normalizados', async () => {
    aiswebHttp.executeXmlQuery.mockResolvedValue(mockParsedMultipleDays);
    const result = await service.execute({ icaoCode: 'SBGR' });
    expect(result.days).toHaveLength(2);
    expect(result.days[0].weekDay).toBe(1);
    expect(result.days[0].geo).toBe('-23.43/-46.47');
    expect(result.days[1].geo).toBeUndefined();
  });

  it('retorna lista vazia quando não há days no XML', async () => {
    aiswebHttp.executeXmlQuery.mockResolvedValue({ aisweb: {} });
    const result = await service.execute({ icaoCode: 'SBGR' });
    expect(result.days).toHaveLength(0);
  });

  it('propaga erros lançados pelo AiswebHttpService', async () => {
    aiswebHttp.executeXmlQuery.mockRejectedValue(new Error('falha HTTP'));
    await expect(service.execute({ icaoCode: 'SBGR' })).rejects.toThrow(
      'falha HTTP',
    );
  });
});
