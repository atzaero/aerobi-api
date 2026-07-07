import { PrismaService } from '@/prisma/prisma.service';

import { MaintenanceTaskRepository } from './maintenance-task.repository';

const MAINTENANCE_ID = '11111111-1111-4111-8111-111111111111';
const TASK_ID = '22222222-2222-4222-8222-222222222222';

describe('MaintenanceTaskRepository', () => {
  let repository: MaintenanceTaskRepository;
  let taskFindMany: jest.Mock;
  let taskUpdate: jest.Mock;
  let guessGroupBy: jest.Mock;
  let guessUpdateMany: jest.Mock;
  let transaction: jest.Mock;

  beforeEach(() => {
    taskFindMany = jest.fn();
    taskUpdate = jest.fn();
    guessGroupBy = jest.fn();
    guessUpdateMany = jest.fn();
    transaction = jest.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({
        maintenanceGuess: { updateMany: guessUpdateMany },
        maintenanceTask: { update: taskUpdate },
      }),
    );

    const prisma = {
      maintenanceTask: { findMany: taskFindMany },
      maintenanceGuess: { groupBy: guessGroupBy },
      $transaction: transaction,
    } as unknown as PrismaService;

    repository = new MaintenanceTaskRepository(prisma);
  });

  describe('findManyByMaintenanceId', () => {
    it('filtra por manutenção + não deletado e não aplica orderBy no banco', async () => {
      taskFindMany.mockResolvedValue([]);

      await repository.findManyByMaintenanceId(MAINTENANCE_ID);

      expect(taskFindMany).toHaveBeenCalledWith({
        where: { maintenanceId: MAINTENANCE_ID, deletedAt: null },
      });
    });
  });

  describe('countActiveGuessesByTaskIds', () => {
    it('lista vazia devolve Map vazio sem consultar o banco', async () => {
      const result = await repository.countActiveGuessesByTaskIds([]);

      expect(result.size).toBe(0);
      expect(guessGroupBy).not.toHaveBeenCalled();
    });

    it('agrupa guesses ativos por taskId e devolve as contagens', async () => {
      guessGroupBy.mockResolvedValue([
        { taskId: 'a', _count: { _all: 2 } },
        { taskId: 'b', _count: { _all: 5 } },
      ]);

      const result = await repository.countActiveGuessesByTaskIds(['a', 'b']);

      expect(guessGroupBy).toHaveBeenCalledWith({
        by: ['taskId'],
        where: { taskId: { in: ['a', 'b'] }, deletedAt: null },
        _count: { _all: true },
      });
      expect(result.get('a')).toBe(2);
      expect(result.get('b')).toBe(5);
    });
  });

  describe('softDelete', () => {
    it('cascateia guesses e task na mesma transação e devolve a contagem', async () => {
      const callOrder: string[] = [];
      guessUpdateMany.mockImplementation(() => {
        callOrder.push('guesses');
        return Promise.resolve({ count: 4 });
      });
      taskUpdate.mockImplementation(() => {
        callOrder.push('task');
        return Promise.resolve({ id: TASK_ID });
      });

      const result = await repository.softDelete(TASK_ID, 'actor-1');

      expect(result.deletedGuesses).toBe(4);
      expect(callOrder).toEqual(['guesses', 'task']);
      expect(guessUpdateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { taskId: TASK_ID, deletedAt: null },
        }),
      );
      expect(taskUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: TASK_ID, deletedAt: null },
        }),
      );

      const [taskCall] = taskUpdate.mock.calls as Array<
        [{ data: { deletedBy: string; updatedBy: string } }]
      >;
      expect(taskCall[0].data.deletedBy).toBe('actor-1');
      expect(taskCall[0].data.updatedBy).toBe('actor-1');
    });
  });
});
