import { Test, TestingModule } from '@nestjs/testing';

import { NotamQueryDto } from '../dtos/notam-query.dto';
import { AiswebHttpService } from './aisweb-http.service';
import { AiswebNotamService } from './aisweb-notam.service';

const mockParsedSingleItem = {
  aisweb: {
    notam: {
      '@_id': '1',
      '@_total': '1',
      '@_updatedat': '2026-04-06T12:00:00',
      item: {
        id: 'N1234/26',
        cod: 'SBGR',
        status: 'N',
        loc: 'SBGR',
      },
    },
  },
};

const mockParsedMultipleItems = {
  aisweb: {
    notam: {
      '@_total': '2',
      '@_updatedat': '2026-04-06T12:00:00',
      item: [
        { id: 'A', cod: 'SBGR', status: 'N' },
        { id: 'B', cod: 'SBSP', status: 'C' },
      ],
    },
  },
};

describe('AiswebNotamService', () => {
  let service: AiswebNotamService;
  let aiswebHttp: jest.Mocked<Pick<AiswebHttpService, 'executeXmlQuery'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiswebNotamService,
        {
          provide: AiswebHttpService,
          useValue: { executeXmlQuery: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AiswebNotamService);
    aiswebHttp = module.get(AiswebHttpService);
  });

  it('chama executeXmlQuery com area "notam" e os parâmetros corretos', async () => {
    aiswebHttp.executeXmlQuery.mockResolvedValue(mockParsedSingleItem);
    const query: NotamQueryDto = {
      dist: 'N',
      nof: '1',
      icaocode: 'SBGR',
      type: 'N',
      dt_start: '2026-04-01',
      dt_end: '2026-04-30',
    };
    await service.execute(query);
    expect(aiswebHttp.executeXmlQuery).toHaveBeenCalledWith('notam', {
      dist: 'N',
      nof: '1',
      serie: undefined,
      categoria: undefined,
      status: undefined,
      fir: undefined,
      nnotam: undefined,
      ano: undefined,
      dt_ref: undefined,
      dt: undefined,
      all: undefined,
      minutes: undefined,
      dt_start: '2026-04-01',
      dt_end: '2026-04-30',
      icaocode: 'SBGR',
      type: 'N',
    });
  });

  it('retorna total, updatedat e item normalizado para resposta com um único item', async () => {
    aiswebHttp.executeXmlQuery.mockResolvedValue(mockParsedSingleItem);
    const result = await service.execute({ icaocode: 'SBGR' });
    expect(result.total).toBe(1);
    expect(result.updatedat).toBe('2026-04-06T12:00:00');
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: 'N1234/26',
      cod: 'SBGR',
      status: 'N',
      loc: 'SBGR',
    });
  });

  it('retorna total e múltiplos items normalizados', async () => {
    aiswebHttp.executeXmlQuery.mockResolvedValue(mockParsedMultipleItems);
    const result = await service.execute({ icaocode: 'SBGR' });
    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.items[1]).toMatchObject({ id: 'B', cod: 'SBSP' });
  });

  it('retorna total 0 e lista vazia quando não há notam no XML', async () => {
    aiswebHttp.executeXmlQuery.mockResolvedValue({ aisweb: {} });
    const result = await service.execute({ icaocode: 'SBGR' });
    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it('propaga erros lançados pelo AiswebHttpService', async () => {
    aiswebHttp.executeXmlQuery.mockRejectedValue(new Error('falha HTTP'));
    await expect(service.execute({ icaocode: 'SBGR' })).rejects.toThrow(
      'falha HTTP',
    );
  });
});
