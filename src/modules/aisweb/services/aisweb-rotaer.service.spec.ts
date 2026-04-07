import { Test, TestingModule } from '@nestjs/testing';

import { RotaerQueryDto } from '../dtos/rotaer-query.dto';
import { AiswebHttpService } from './aisweb-http.service';
import { AiswebRotaerService } from './aisweb-rotaer.service';

const mockParsedMinimal = {
  aisweb: {
    status: 'OK',
    dt: '2026-04-06',
    AeroCode: 'SBGR',
    name: 'Aeroporto Internacional de Guarulhos',
  },
};

describe('AiswebRotaerService', () => {
  let service: AiswebRotaerService;
  let aiswebHttp: jest.Mocked<Pick<AiswebHttpService, 'executeXmlQuery'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiswebRotaerService,
        {
          provide: AiswebHttpService,
          useValue: { executeXmlQuery: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AiswebRotaerService);
    aiswebHttp = module.get(AiswebHttpService);
  });

  it('chama executeXmlQuery com area "rotaer" e icaoCode', async () => {
    aiswebHttp.executeXmlQuery.mockResolvedValue(mockParsedMinimal);
    const query: RotaerQueryDto = { icaoCode: 'SBGR' };
    await service.execute(query);
    expect(aiswebHttp.executeXmlQuery).toHaveBeenCalledWith('rotaer', {
      icaoCode: 'SBGR',
    });
  });

  it('retorna DTO montado por buildRotaerDto a partir do XML parseado', async () => {
    aiswebHttp.executeXmlQuery.mockResolvedValue(mockParsedMinimal);
    const result = await service.execute({ icaoCode: 'SBGR' });
    expect(result.meta).toEqual({ status: 'OK', dt: '2026-04-06' });
    expect(result.identification).toEqual({
      icao: 'SBGR',
      ciad: undefined,
      name: 'Aeroporto Internacional de Guarulhos',
    });
  });

  it('retorna objeto vazio quando não há nó aisweb', async () => {
    aiswebHttp.executeXmlQuery.mockResolvedValue({});
    const result = await service.execute({ icaoCode: 'SBGR' });
    expect(result).toEqual({});
  });

  it('propaga erros lançados pelo AiswebHttpService', async () => {
    aiswebHttp.executeXmlQuery.mockRejectedValue(new Error('falha HTTP'));
    await expect(service.execute({ icaoCode: 'SBGR' })).rejects.toThrow(
      'falha HTTP',
    );
  });
});
