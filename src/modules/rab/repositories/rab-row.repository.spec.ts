import { Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { RabCsvRow } from '../types/rab-csv-row.type';

import { RabRowRepository } from './rab-row.repository';

function mockCsvRow(overrides: Partial<RabCsvRow> = {}): RabCsvRow {
  const base: RabCsvRow = {
    period: '2026-03',
    marcas: 'PTABC',
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
  };
  return { ...base, ...overrides };
}

describe('RabRowRepository', () => {
  let repository: RabRowRepository;
  let findFirst: jest.Mock;
  let findMany: jest.Mock;
  let count: jest.Mock;
  let $executeRaw: jest.Mock;

  beforeEach(() => {
    findFirst = jest.fn().mockResolvedValue(null);
    findMany = jest.fn().mockResolvedValue([]);
    count = jest.fn().mockResolvedValue(0);
    $executeRaw = jest.fn().mockResolvedValue(undefined);
    const prisma = {
      rabRow: { findFirst, findMany, count },
      $executeRaw,
    } as unknown as PrismaService;
    repository = new RabRowRepository(prisma);
  });

  describe('findLatestByMarcas', () => {
    it('busca a linha mais recente por marcas (case-insensitive, period desc)', async () => {
      await repository.findLatestByMarcas('PTKOB');

      expect(findFirst).toHaveBeenCalledWith({
        where: { marcas: { equals: 'PTKOB', mode: 'insensitive' } },
        orderBy: { period: 'desc' },
      });
    });

    it('propaga o retorno do Prisma (null quando não há match)', async () => {
      findFirst.mockResolvedValue(null);

      await expect(repository.findLatestByMarcas('XXXX')).resolves.toBeNull();
    });
  });

  describe('findMany', () => {
    it('repassa where/skip/take e ordena por marcas asc', async () => {
      const where: Prisma.RabRowWhereInput = { period: '2026-03' };

      await repository.findMany(where, 20, 10);

      expect(findMany).toHaveBeenCalledWith({
        where,
        skip: 20,
        take: 10,
        orderBy: { marcas: 'asc' },
      });
    });
  });

  describe('count', () => {
    it('repassa o where', async () => {
      const where: Prisma.RabRowWhereInput = { period: '2026-03' };

      await repository.count(where);

      expect(count).toHaveBeenCalledWith({ where });
    });
  });

  describe('upsertBatch', () => {
    it('não executa nada para lista vazia', async () => {
      await repository.upsertBatch([]);

      expect($executeRaw).not.toHaveBeenCalled();
    });

    it('executa uma única query para um lote abaixo do CHUNK_SIZE', async () => {
      await repository.upsertBatch([
        mockCsvRow(),
        mockCsvRow({ marcas: 'PTXYZ' }),
      ]);

      expect($executeRaw).toHaveBeenCalledTimes(1);
    });

    it('particiona em múltiplas queries acima do CHUNK_SIZE (500)', async () => {
      const rows = Array.from({ length: 501 }, (_, i) =>
        mockCsvRow({ marcas: `PT${i}` }),
      );

      await repository.upsertBatch(rows);

      expect($executeRaw).toHaveBeenCalledTimes(2);
    });
  });
});
