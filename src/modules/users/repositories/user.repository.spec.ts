import { UserRole } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import { buildUserFixture } from '../testing/user.fixtures';

import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let repository: UserRepository;

  let findUnique: jest.Mock;
  let findFirst: jest.Mock;
  let findMany: jest.Mock;
  let count: jest.Mock;
  let create: jest.Mock;
  let update: jest.Mock;
  let $transaction: jest.Mock;

  beforeEach(() => {
    findUnique = jest.fn();
    findFirst = jest.fn();
    findMany = jest.fn();
    count = jest.fn();
    create = jest.fn();
    update = jest.fn();
    $transaction = jest.fn();

    const prisma = {
      user: { findUnique, findFirst, findMany, count, create, update },
      $transaction,
    } as unknown as PrismaService;

    repository = new UserRepository(prisma);
  });

  describe('findByEmail', () => {
    it('consulta por email único e repassa o resultado', async () => {
      const user = buildUserFixture({ email: 'a@x' });
      findUnique.mockResolvedValue(user);

      await expect(repository.findByEmail('a@x')).resolves.toBe(user);
      expect(findUnique).toHaveBeenCalledWith({ where: { email: 'a@x' } });
    });

    it('repassa null quando não encontra', async () => {
      findUnique.mockResolvedValue(null);
      await expect(repository.findByEmail('a@x')).resolves.toBeNull();
    });
  });

  describe('findById', () => {
    it('consulta por id único', async () => {
      const user = buildUserFixture({ id: 'u-1' });
      findUnique.mockResolvedValue(user);

      await expect(repository.findById('u-1')).resolves.toBe(user);
      expect(findUnique).toHaveBeenCalledWith({ where: { id: 'u-1' } });
    });
  });

  describe('findActiveById', () => {
    it('filtra por id e deletedAt null', async () => {
      const user = buildUserFixture({ id: 'u-1' });
      findFirst.mockResolvedValue(user);

      await expect(repository.findActiveById('u-1')).resolves.toBe(user);
      expect(findFirst).toHaveBeenCalledWith({
        where: { id: 'u-1', deletedAt: null },
      });
    });
  });

  describe('existsByEmail', () => {
    it('true quando count > 0', async () => {
      count.mockResolvedValue(1);
      await expect(repository.existsByEmail('a@x')).resolves.toBe(true);
      expect(count).toHaveBeenCalledWith({ where: { email: 'a@x' } });
    });

    it('false quando count = 0', async () => {
      count.mockResolvedValue(0);
      await expect(repository.existsByEmail('a@x')).resolves.toBe(false);
    });
  });

  describe('create', () => {
    it('persiste com o input montado pelo builder', async () => {
      const user = buildUserFixture();
      create.mockResolvedValue(user);

      const result = await repository.create({
        email: 'a@x',
        name: 'A',
        role: UserRole.OPERATOR,
        groupId: 'g1',
        createdBy: 'admin-1',
      });

      expect(result).toBe(user);
      expect(create).toHaveBeenCalledWith({
        data: {
          email: 'a@x',
          name: 'A',
          role: UserRole.OPERATOR,
          groupId: 'g1',
          createdBy: 'admin-1',
        },
      });
    });
  });

  describe('update', () => {
    it('atualiza por id com o input montado pelo builder', async () => {
      const user = buildUserFixture({ id: 'u-1', name: 'Novo' });
      update.mockResolvedValue(user);

      const result = await repository.update('u-1', {
        name: 'Novo',
        updatedBy: 'admin-1',
      });

      expect(result).toBe(user);
      expect(update).toHaveBeenCalledWith({
        where: { id: 'u-1' },
        data: { name: 'Novo', updatedBy: 'admin-1' },
      });
    });
  });

  describe('softDelete', () => {
    it('marca deletedAt/deletedBy/updatedBy quando deletedBy informado', async () => {
      const user = buildUserFixture({ id: 'u-1', deletedAt: new Date() });
      update.mockResolvedValue(user);

      const result = await repository.softDelete('u-1', 'admin-1');

      expect(result).toBe(user);
      expect(update).toHaveBeenCalledTimes(1);
      const updateCalls = update.mock.calls as Array<
        [
          {
            where: { id: string };
            data: { deletedAt: Date; deletedBy?: string; updatedBy?: string };
          },
        ]
      >;
      const [arg] = updateCalls[0];
      expect(arg.where).toEqual({ id: 'u-1' });
      expect(arg.data.deletedAt).toBeInstanceOf(Date);
      expect(arg.data.deletedBy).toBe('admin-1');
      expect(arg.data.updatedBy).toBe('admin-1');
    });

    it('marca apenas deletedAt quando deletedBy ausente', async () => {
      update.mockResolvedValue(buildUserFixture({ id: 'u-1' }));

      await repository.softDelete('u-1');

      const updateCalls = update.mock.calls as Array<
        [{ data: { deletedAt: Date; deletedBy?: string } }]
      >;
      const [arg] = updateCalls[0];
      expect(arg.data.deletedAt).toBeInstanceOf(Date);
      expect('deletedBy' in arg.data).toBe(false);
    });
  });

  describe('findManyPaginated', () => {
    it('executa findMany + count em transação e devolve { rows, total }', async () => {
      const rows = [buildUserFixture()];
      findMany.mockReturnValue('findMany-promise');
      count.mockReturnValue('count-promise');
      $transaction.mockResolvedValue([rows, 42]);

      const result = await repository.findManyPaginated({
        skip: 10,
        take: 20,
        role: UserRole.ADMIN,
      });

      expect(result).toEqual({ rows, total: 42 });
      expect($transaction).toHaveBeenCalledWith([
        'findMany-promise',
        'count-promise',
      ]);
      expect(findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, role: UserRole.ADMIN },
        skip: 10,
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
      expect(count).toHaveBeenCalledWith({
        where: { deletedAt: null, role: UserRole.ADMIN },
      });
    });
  });

  describe('findManyForExport', () => {
    it('inclui o nome do grupo e respeita o limite', async () => {
      const rows = [buildUserFixture()];
      findMany.mockResolvedValue(rows);

      const result = await repository.findManyForExport({ groupId: 'g1' }, 500);

      expect(result).toBe(rows);
      expect(findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, groupId: 'g1' },
        orderBy: { createdAt: 'desc' },
        take: 500,
        include: { group: { select: { name: true } } },
      });
    });
  });

  describe('countForExport', () => {
    it('conta aplicando o where dos filtros', async () => {
      count.mockResolvedValue(7);

      await expect(
        repository.countForExport({ role: UserRole.TECHNICAL }),
      ).resolves.toBe(7);
      expect(count).toHaveBeenCalledWith({
        where: { deletedAt: null, role: UserRole.TECHNICAL },
      });
    });
  });
});
