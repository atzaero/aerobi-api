import { PrismaService } from '@/prisma/prisma.service';

import {
  buildAerodromeVisibleWithGroupFixture,
  buildAerodromeWithGroupFixture,
} from '../testing/aerodrome.entity.fixture';

import { AerodromeRepository } from './aerodrome.repository';

const includeGroupUf = { group: { select: { uf: true } } };

const includeVisible = {
  group: { select: { uf: true } },
  geojson: {
    where: { deletedAt: null },
    select: {
      status: true,
      kind: true,
      mapFileType: true,
      geoJson: true,
    },
  },
};

describe('AerodromeRepository', () => {
  let repository: AerodromeRepository;

  let create: jest.Mock;
  let update: jest.Mock;
  let findFirst: jest.Mock;
  let findMany: jest.Mock;
  let count: jest.Mock;
  let groupFindFirst: jest.Mock;

  beforeEach(() => {
    create = jest.fn();
    update = jest.fn();
    findFirst = jest.fn();
    findMany = jest.fn();
    count = jest.fn();
    groupFindFirst = jest.fn();

    const prisma = {
      aerodrome: { create, update, findFirst, findMany, count },
      group: { findFirst: groupFindFirst },
    } as unknown as PrismaService;

    repository = new AerodromeRepository(prisma);
  });

  it('create: passa data e inclui a UF do grupo', async () => {
    const saved = buildAerodromeWithGroupFixture();
    create.mockResolvedValue(saved);
    const data = { icao: 'SBSP' } as never;

    await expect(repository.create(data)).resolves.toBe(saved);
    expect(create).toHaveBeenCalledWith({ data, include: includeGroupUf });
  });

  it('update: filtra por id + não removido, aplica data e inclui grupo', async () => {
    const saved = buildAerodromeWithGroupFixture();
    update.mockResolvedValue(saved);
    const data = { name: 'Novo' } as never;

    await repository.update('a-1', data);
    expect(update).toHaveBeenCalledWith({
      where: { id: 'a-1', deletedAt: null },
      data,
      include: includeGroupUf,
    });
  });

  it('findById: só registros não removidos, com UF do grupo', async () => {
    const found = buildAerodromeWithGroupFixture({ id: 'a-1' });
    findFirst.mockResolvedValue(found);

    await expect(repository.findById('a-1')).resolves.toBe(found);
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: 'a-1', deletedAt: null },
      include: includeGroupUf,
    });
  });

  it('findMany: combina where do chamador com soft-delete, ordena por createdAt DESC e inclui grupo', async () => {
    findMany.mockResolvedValue([]);
    const where = { groupId: 'g-1' };

    await repository.findMany(where, 10, 20);
    expect(findMany).toHaveBeenCalledWith({
      where: { AND: [{ groupId: 'g-1' }, { deletedAt: null }] },
      skip: 10,
      take: 20,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      include: includeGroupUf,
    });
  });

  it('findAllVisible: só isView=true + soft-delete, inclui GeoJSON ativo', async () => {
    findMany.mockResolvedValue([]);

    await repository.findAllVisible();
    expect(findMany).toHaveBeenCalledWith({
      where: { isView: true, deletedAt: null },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      include: includeVisible,
    });
  });

  it('findVisibleByIcao: ICAO + isView + soft-delete, inclui GeoJSON ativo', async () => {
    const found = buildAerodromeVisibleWithGroupFixture({
      icao: 'SJ4E',
      isView: true,
    });
    findFirst.mockResolvedValue(found);

    await expect(repository.findVisibleByIcao('SJ4E')).resolves.toBe(found);
    expect(findFirst).toHaveBeenCalledWith({
      where: { icao: 'SJ4E', isView: true, deletedAt: null },
      include: includeVisible,
    });
  });

  it('count: aplica o mesmo AND de soft-delete', async () => {
    count.mockResolvedValue(3);
    await expect(repository.count({ isOpen: true })).resolves.toBe(3);
    expect(count).toHaveBeenCalledWith({
      where: { AND: [{ isOpen: true }, { deletedAt: null }] },
    });
  });

  it('softDelete: grava deletedAt/deletedBy/updatedBy e inclui grupo', async () => {
    const removed = buildAerodromeWithGroupFixture({ id: 'a-1' });
    update.mockResolvedValue(removed);

    await repository.softDelete('a-1', 'actor-9');
    expect(update).toHaveBeenCalledWith({
      where: { id: 'a-1', deletedAt: null },
      data: {
        deletedAt: expect.any(Date) as Date,
        deletedBy: 'actor-9',
        updatedBy: 'actor-9',
      },
      include: includeGroupUf,
    });
  });

  it('findActiveGroup: busca grupo ativo pelo id (só o id)', async () => {
    groupFindFirst.mockResolvedValue({ id: 'g-1' });

    await expect(repository.findActiveGroup('g-1')).resolves.toEqual({
      id: 'g-1',
    });
    expect(groupFindFirst).toHaveBeenCalledWith({
      where: { id: 'g-1', deletedAt: null },
      select: { id: true },
    });
  });

  it('findActiveGroup: null quando inexistente/removido', async () => {
    groupFindFirst.mockResolvedValue(null);
    await expect(repository.findActiveGroup('nope')).resolves.toBeNull();
  });

  describe('findForDashboardSnapshot', () => {
    const snapshotSelect = {
      isOpen: true,
      isView: true,
      construction: true,
      lit: true,
      fueling: true,
    };

    it('escopo `all` (null): só soft-delete, sem filtro de id', async () => {
      findMany.mockResolvedValue([]);

      await repository.findForDashboardSnapshot(null);

      expect(findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        select: snapshotSelect,
      });
    });

    it('escopo `group`: filtra id por lista', async () => {
      findMany.mockResolvedValue([]);

      await repository.findForDashboardSnapshot(['a-1', 'a-2']);

      expect(findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, id: { in: ['a-1', 'a-2'] } },
        select: snapshotSelect,
      });
    });

    it('escopo vazio (`none`): id `in: []` (nenhum aeródromo)', async () => {
      findMany.mockResolvedValue([]);

      await repository.findForDashboardSnapshot([]);

      expect(findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, id: { in: [] } },
        select: snapshotSelect,
      });
    });
  });

  describe('findActiveIdsByGroup', () => {
    it('lista os ids ativos do grupo', async () => {
      findMany.mockResolvedValue([{ id: 'a-1' }, { id: 'a-2' }]);

      await expect(repository.findActiveIdsByGroup('g-1')).resolves.toEqual([
        'a-1',
        'a-2',
      ]);
      expect(findMany).toHaveBeenCalledWith({
        where: { groupId: 'g-1', deletedAt: null },
        select: { id: true },
      });
    });
  });
});
