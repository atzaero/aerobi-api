import { Test, TestingModule } from '@nestjs/testing';

import { InfotempQueryDto } from '../dtos/infotemp-query.dto';
import { AiswebHttpService } from './aisweb-http.service';
import { AiswebInfotempService } from './aisweb-infotemp.service';

const mockParsedSingleItem = {
  aisweb: {
    infotemp: {
      '@_total': '1',
      item: {
        number: '001',
        rmk: 'Temperatura máxima 38°C',
        action: 'A',
        startdate: '2026-04-01',
        enddate: '2026-04-30',
        dt: '2026-04-06',
      },
    },
  },
};

const mockParsedMultipleItems = {
  aisweb: {
    infotemp: {
      '@_total': '2',
      item: [
        {
          number: '001',
          rmk: 'Temperatura máxima 38°C',
          action: 'A',
          startdate: '2026-04-01',
          enddate: '2026-04-30',
          dt: '2026-04-06',
        },
        {
          number: '002',
          rmk: 'Temperatura mínima 12°C',
          action: 'A',
          startdate: '2026-04-02',
          enddate: '2026-04-29',
          dt: '2026-04-06',
        },
      ],
    },
  },
};

describe('AiswebInfotempService', () => {
  let service: AiswebInfotempService;
  let aiswebHttp: jest.Mocked<Pick<AiswebHttpService, 'executeXmlQuery'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiswebInfotempService,
        {
          provide: AiswebHttpService,
          useValue: { executeXmlQuery: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AiswebInfotempService);
    aiswebHttp = module.get(AiswebHttpService);
  });

  it('chama executeXmlQuery com area "infotemp" e os parâmetros corretos', async () => {
    aiswebHttp.executeXmlQuery.mockResolvedValue(mockParsedSingleItem);
    const query: InfotempQueryDto = {
      icaoCode: 'SBGR',
      number: '001',
      status: 0,
      dist: 'N',
    };
    await service.execute(query);
    expect(aiswebHttp.executeXmlQuery).toHaveBeenCalledWith('infotemp', {
      icaoCode: 'SBGR',
      number: '001',
      status: 0,
      dist: 'N',
    });
  });

  it('retorna total e item normalizado para resposta com um único item', async () => {
    aiswebHttp.executeXmlQuery.mockResolvedValue(mockParsedSingleItem);
    const result = await service.execute({ icaoCode: 'SBGR' });
    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      number: '001',
      rmk: 'Temperatura máxima 38°C',
    });
  });

  it('retorna total e múltiplos items normalizados', async () => {
    aiswebHttp.executeXmlQuery.mockResolvedValue(mockParsedMultipleItems);
    const result = await service.execute({ icaoCode: 'SBGR' });
    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.items[1]).toMatchObject({ number: '002' });
  });

  it('retorna total 0 e lista vazia quando não há items', async () => {
    aiswebHttp.executeXmlQuery.mockResolvedValue({ aisweb: {} });
    const result = await service.execute({ icaoCode: 'SBGR' });
    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it('propaga erros lançados pelo AiswebHttpService', async () => {
    aiswebHttp.executeXmlQuery.mockRejectedValue(new Error('falha HTTP'));
    await expect(service.execute({ icaoCode: 'SBGR' })).rejects.toThrow(
      'falha HTTP',
    );
  });
});
