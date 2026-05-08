import type { RabRow } from '@/generated/prisma/client';

import { RabRowRepository } from '../repositories/rab-row.repository';

import { AnacIndexService } from './anac-index.service';
import { RabRowsService } from './rab-rows.service';

function mockRabRow(overrides: Partial<RabRow> = {}): RabRow {
  return {
    id: 'row-1',
    period: '2026-03',
    marcas: 'PP-ABC',
    proprietarios: null,
    operadores: null,
    nrCertMatricula: null,
    nrSerie: null,
    cdTipo: null,
    dsModelo: null,
    nmFabricante: null,
    cdCls: null,
    nrPmd: null,
    cdTipoIcao: null,
    nrTripulacaoMin: null,
    nrPassageirosMax: null,
    nrAssentos: null,
    nrAnoFabricacao: null,
    dtValidadeCva: null,
    dtValidadeCa: null,
    dtCanc: null,
    dsMotivoCanc: null,
    cdInterdicao: null,
    dsGravame: null,
    dtMatricula: null,
    tpMotor: null,
    qtMotor: null,
    tpPouso: null,
    tpCa: null,
    cdPropositoCave: null,
    cfOperacional: null,
    dsCategoriaHomologacao: null,
    tpOperacao: null,
    ...overrides,
  };
}

describe('RabRowsService', () => {
  let service: RabRowsService;
  let findMany: jest.Mock;
  let count: jest.Mock;
  let executeAnac: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn().mockResolvedValue([]);
    count = jest.fn().mockResolvedValue(0);
    executeAnac = jest.fn().mockResolvedValue('2026-10');
    const rowRepo = {
      findMany,
      count,
    } as unknown as RabRowRepository;
    const anacIndex = {
      execute: executeAnac,
    } as unknown as AnacIndexService;
    service = new RabRowsService(rowRepo, anacIndex);
  });

  describe('success', () => {
    it('returns paginated response with defaults page=1 and limit=10', async () => {
      const rows = [mockRabRow()];
      findMany.mockResolvedValue(rows);
      count.mockResolvedValue(42);

      const result = await service.execute({
        period: '2026-03',
      });

      expect(result.data).toEqual(rows);
      expect(executeAnac).not.toHaveBeenCalled();
      expect(result.meta).toMatchObject({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 42,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: false,
      });
      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({ period: '2026-03' }),
        0,
        10,
      );
      expect(count).toHaveBeenCalledWith(
        expect.objectContaining({ period: '2026-03' }),
      );
    });

    it('resolves period from AnacIndexService when period is omitted', async () => {
      findMany.mockResolvedValue([mockRabRow({ period: '2026-10' })]);
      count.mockResolvedValue(1);

      await service.execute({});

      expect(executeAnac).toHaveBeenCalledTimes(1);
      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({ period: '2026-10' }),
        0,
        10,
      );
    });

    it('uses custom page and limit for skip and meta', async () => {
      findMany.mockResolvedValue([mockRabRow({ id: 'a' })]);
      count.mockResolvedValue(100);

      const result = await service.execute({
        period: '2026-01',
        page: 3,
        limit: 25,
      });

      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({ period: '2026-01' }),
        50,
        25,
      );
      expect(result.meta.currentPage).toBe(3);
      expect(result.meta.itemsPerPage).toBe(25);
      expect(result.meta.totalItems).toBe(100);
      expect(result.meta.totalPages).toBe(4);
      expect(result.meta.hasPreviousPage).toBe(true);
    });

    it('clamps limit to maximum 200', async () => {
      await service.execute({
        period: '2026-03',
        page: 1,
        limit: 999,
      });

      expect(findMany).toHaveBeenCalledWith(expect.any(Object), 0, 200);
    });

    it('clamps limit below minimum to 1', async () => {
      await service.execute({
        period: '2026-03',
        page: 1,
        limit: 0,
      });

      expect(findMany).toHaveBeenCalledWith(expect.any(Object), 0, 1);
    });

    it('passes filters into where clause via repository', async () => {
      await service.execute({
        period: '2026-03',
        marcas: 'PP-',
        nrCertMatricula: 'cert',
      });

      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          period: '2026-03',
          marcas: { contains: 'PP-', mode: 'insensitive' },
          nrCertMatricula: { contains: 'cert', mode: 'insensitive' },
        }),
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('returns empty data when total is zero', async () => {
      findMany.mockResolvedValue([]);
      count.mockResolvedValue(0);

      const result = await service.execute({
        period: '2026-03',
      });

      expect(result.data).toEqual([]);
      expect(result.meta.totalItems).toBe(0);
      expect(result.meta.totalPages).toBe(0);
      expect(result.meta.hasNextPage).toBe(false);
    });
  });

  describe('errors and failures', () => {
    it('propagates when findMany rejects', async () => {
      const dbError = new Error('connection refused');
      findMany.mockRejectedValue(dbError);
      count.mockResolvedValue(0);

      await expect(
        service.execute({
          period: '2026-03',
        }),
      ).rejects.toThrow('connection refused');
    });

    it('propagates when count rejects', async () => {
      findMany.mockResolvedValue([]);
      count.mockRejectedValue(new Error('count timeout'));

      await expect(
        service.execute({
          period: '2026-03',
        }),
      ).rejects.toThrow('count timeout');
    });

    it('propagates when both parallel calls fail (findMany rejects first)', async () => {
      findMany.mockRejectedValue(new Error('read failed'));
      count.mockResolvedValue(5);

      await expect(
        service.execute({
          period: '2026-03',
        }),
      ).rejects.toThrow('read failed');
    });

    it('propagates when AnacIndexService fails and period is omitted', async () => {
      executeAnac.mockRejectedValue(new Error('index unreachable'));

      await expect(service.execute({})).rejects.toThrow('index unreachable');
      expect(findMany).not.toHaveBeenCalled();
    });
  });
});
