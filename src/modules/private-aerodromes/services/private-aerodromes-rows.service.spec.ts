import type { PrivateAerodrome } from '@/generated/prisma/client';

import { PrivateAerodromesFindAllQueryDTO } from '../dtos/private-aerodromes-find-all-query.dto';
import { PrivateAerodromeRepository } from '../repositories/private-aerodrome.repository';

import { PrivateAerodromesRowsService } from './private-aerodromes-rows.service';

function mockPrivateAerodrome(
  overrides: Partial<PrivateAerodrome> = {},
): PrivateAerodrome {
  return {
    id: 'aerodrome-1',
    ciad: 'SJXX',
    codigoOaci: null,
    nome: 'Aeródromo Teste',
    municipio: 'São Paulo',
    uf: 'SP',
    longitude: null,
    latitude: null,
    altitude: null,
    operacaoDiurna: null,
    operacaoNoturna: null,
    designacao1: null,
    comprimento1: null,
    largura1: null,
    resistencia1: null,
    superficie1: null,
    designacao2: null,
    comprimento2: null,
    largura2: null,
    resistencia2: null,
    superficie2: null,
    portariaRegistro: null,
    linkPortaria: null,
    latGeoPoint: null,
    lonGeoPoint: null,
    ...overrides,
  };
}

describe('PrivateAerodromesRowsService', () => {
  let service: PrivateAerodromesRowsService;
  let findMany: jest.Mock;
  let count: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn().mockResolvedValue([]);
    count = jest.fn().mockResolvedValue(0);
    const repo = { findMany, count } as unknown as PrivateAerodromeRepository;
    service = new PrivateAerodromesRowsService(repo);
  });

  describe('success', () => {
    it('retorna resposta paginada com defaults page=1 e limit=10', async () => {
      const rows = [mockPrivateAerodrome()];
      findMany.mockResolvedValue(rows);
      count.mockResolvedValue(42);

      const result = await service.execute({});

      expect(result.data).toEqual(rows);
      expect(result.meta).toMatchObject({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 42,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: false,
      });
      expect(findMany).toHaveBeenCalledWith(expect.any(Object), 0, 10);
      expect(count).toHaveBeenCalledWith(expect.any(Object));
    });

    it('usa page e limit customizados para skip e meta corretos', async () => {
      findMany.mockResolvedValue([mockPrivateAerodrome({ id: 'a' })]);
      count.mockResolvedValue(100);

      const result = await service.execute({
        page: 3,
        limit: 25,
      });

      expect(findMany).toHaveBeenCalledWith(expect.any(Object), 50, 25);
      expect(result.meta.currentPage).toBe(3);
      expect(result.meta.itemsPerPage).toBe(25);
      expect(result.meta.totalItems).toBe(100);
      expect(result.meta.totalPages).toBe(4);
      expect(result.meta.hasPreviousPage).toBe(true);
    });

    it('limita o limit ao máximo de 200', async () => {
      await service.execute({
        page: 1,
        limit: 999,
      });

      expect(findMany).toHaveBeenCalledWith(expect.any(Object), 0, 200);
    });

    it('limita o limit abaixo do mínimo para 1', async () => {
      await service.execute({
        page: 1,
        limit: 0,
      });

      expect(findMany).toHaveBeenCalledWith(expect.any(Object), 0, 1);
    });

    it('repassa filtros no where clause', async () => {
      await service.execute({
        ciad: 'SJ',
        uf: 'SP',
        municipio: 'São',
      });

      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          ciad: { contains: 'SJ', mode: 'insensitive' },
          uf: { contains: 'SP', mode: 'insensitive' },
          municipio: { contains: 'São', mode: 'insensitive' },
        }),
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('retorna data vazio e totalItems zero quando sem resultados', async () => {
      findMany.mockResolvedValue([]);
      count.mockResolvedValue(0);

      const result = await service.execute({});

      expect(result.data).toEqual([]);
      expect(result.meta.totalItems).toBe(0);
      expect(result.meta.totalPages).toBe(0);
      expect(result.meta.hasNextPage).toBe(false);
    });
  });

  describe('erros', () => {
    it('propaga rejeição de findMany', async () => {
      findMany.mockRejectedValue(new Error('connection refused'));
      count.mockResolvedValue(0);

      await expect(service.execute({})).rejects.toThrow('connection refused');
    });

    it('propaga rejeição de count', async () => {
      findMany.mockResolvedValue([]);
      count.mockRejectedValue(new Error('count timeout'));

      await expect(service.execute({})).rejects.toThrow('count timeout');
    });
  });
});
