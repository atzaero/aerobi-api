import { GuessStatus } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import { MaintenanceGuessRepository } from './maintenance-guess.repository';

describe('MaintenanceGuessRepository', () => {
  let repository: MaintenanceGuessRepository;

  let create: jest.Mock;
  let update: jest.Mock;
  let findFirst: jest.Mock;
  let findMany: jest.Mock;

  beforeEach(() => {
    create = jest.fn();
    update = jest.fn();
    findFirst = jest.fn();
    findMany = jest.fn();

    const prisma = {
      maintenanceGuess: { create, update, findFirst, findMany },
    } as unknown as PrismaService;

    repository = new MaintenanceGuessRepository(prisma);
  });

  it('findById: filtra soft-delete em guess/task/maintenance e inclui maintenanceId', async () => {
    const found = { id: 'g1', task: { maintenanceId: 'm1' } };
    findFirst.mockResolvedValue(found);

    await expect(repository.findById('g1')).resolves.toBe(found);
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: 'g1',
        deletedAt: null,
        task: { deletedAt: null, maintenance: { deletedAt: null } },
      },
      include: { task: { select: { maintenanceId: true } } },
    });
  });

  it('findById: null quando inexistente/removido', async () => {
    findFirst.mockResolvedValue(null);
    await expect(repository.findById('nope')).resolves.toBeNull();
  });

  it('findActiveByTaskId: só ativos da tarefa, ordenados por createdAt DESC', async () => {
    findMany.mockResolvedValue([]);

    await repository.findActiveByTaskId('task-1');
    expect(findMany).toHaveBeenCalledWith({
      where: { taskId: 'task-1', deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('findActiveByMaintenanceId: filtra soft-delete no guess e na task, ordena DESC', async () => {
    findMany.mockResolvedValue([]);

    await repository.findActiveByMaintenanceId('m1');
    expect(findMany).toHaveBeenCalledWith({
      where: {
        task: { maintenanceId: 'm1', deletedAt: null },
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('create: repassa o data para o Prisma', async () => {
    const saved = { id: 'g1' };
    create.mockResolvedValue(saved);
    const data = { text: 'sugestão' } as never;

    await expect(repository.create(data)).resolves.toBe(saved);
    expect(create).toHaveBeenCalledWith({ data });
  });

  it('updateStatus: filtra por id + não removido, grava status e updatedBy', async () => {
    const updated = { id: 'g1', status: GuessStatus.CONSIDERED };
    update.mockResolvedValue(updated);

    await expect(
      repository.updateStatus('g1', GuessStatus.CONSIDERED, 'actor-9'),
    ).resolves.toBe(updated);
    expect(update).toHaveBeenCalledWith({
      where: { id: 'g1', deletedAt: null },
      data: { status: GuessStatus.CONSIDERED, updatedBy: 'actor-9' },
    });
  });

  /**
   * O `data` é afirmado por igualdade profunda (não `objectContaining`): um
   * `updatedAt` manual extra faria o `toHaveBeenCalledWith` falhar — a coluna é
   * `@updatedAt`, gerida pelo Prisma.
   */
  it('softDelete: grava deletedAt/deletedBy/updatedBy sem tocar updatedAt (usa @updatedAt)', async () => {
    const removed = { id: 'g1' };
    update.mockResolvedValue(removed);

    await repository.softDelete('g1', 'actor-9');
    expect(update).toHaveBeenCalledWith({
      where: { id: 'g1', deletedAt: null },
      data: {
        deletedAt: expect.any(Date) as Date,
        deletedBy: 'actor-9',
        updatedBy: 'actor-9',
      },
    });
  });
});
