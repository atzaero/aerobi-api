import { PrismaService } from '@/prisma/prisma.service';

import { MaintenanceRepository } from './maintenance.repository';

describe('MaintenanceRepository — softDeleteWithTasks', () => {
  let repository: MaintenanceRepository;
  let maintenanceUpdate: jest.Mock;
  let maintenanceGuessUpdateMany: jest.Mock;
  let maintenanceTaskUpdateMany: jest.Mock;
  let transaction: jest.Mock;

  beforeEach(() => {
    maintenanceUpdate = jest.fn();
    maintenanceGuessUpdateMany = jest.fn();
    maintenanceTaskUpdateMany = jest.fn();

    transaction = jest.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({
        maintenance: {
          update: maintenanceUpdate,
        },
        maintenanceGuess: {
          updateMany: maintenanceGuessUpdateMany,
        },
        maintenanceTask: {
          updateMany: maintenanceTaskUpdateMany,
        },
      }),
    );

    const prisma = {
      $transaction: transaction,
    } as unknown as PrismaService;

    repository = new MaintenanceRepository(prisma);
  });

  it('exclui guesses antes das tasks (cascade)', async () => {
    const callOrder: string[] = [];
    maintenanceUpdate.mockImplementation(() => {
      callOrder.push('maintenance');
      return Promise.resolve({ id: 'm1' });
    });
    maintenanceGuessUpdateMany.mockImplementation(() => {
      callOrder.push('guesses');
      return Promise.resolve({ count: 2 });
    });
    maintenanceTaskUpdateMany.mockImplementation(() => {
      callOrder.push('tasks');
      return Promise.resolve({ count: 3 });
    });

    const result = await repository.softDeleteWithTasks('m1', 'actor-1');

    expect(result.deletedTasks).toBe(3);
    expect(callOrder).toEqual(['maintenance', 'guesses', 'tasks']);
    expect(maintenanceGuessUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { task: { maintenanceId: 'm1' }, deletedAt: null },
      }),
    );
  });
});
