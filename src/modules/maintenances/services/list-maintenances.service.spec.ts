import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { UserRole } from '@/generated/prisma/client';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { MaintenanceRepository } from '../repositories/maintenance.repository';
import { MaintenanceTaskRepository } from '@/modules/tasks/repositories/maintenance-task.repository';

import { ListMaintenancesService } from './list-maintenances.service';

describe('ListMaintenancesService', () => {
  let service: ListMaintenancesService;
  let findMany: jest.Mock;
  let findTasksForMaintenanceIds: jest.Mock;
  let findGroupIdByUserId: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn();
    findTasksForMaintenanceIds = jest.fn();
    findGroupIdByUserId = jest.fn();

    service = new ListMaintenancesService(
      { findMany } as unknown as MaintenanceRepository,
      {
        findTasksForMaintenanceIds,
      } as unknown as MaintenanceTaskRepository,
      { findGroupIdByUserId } as unknown as UserRepository,
      {
        getMessage: jest.fn((code: string) => code),
      } as unknown as ErrorMessageService,
    );
  });

  it('pagina e enriquece com contagem de atraso', async () => {
    findGroupIdByUserId.mockResolvedValue(null);
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    findMany.mockResolvedValue([
      {
        id: 'm1',
        name: 'Plano',
        aerodromeId: 'a1',
        securityCode: 'CODE',
        authorizedEmails: [],
        createdAt: updatedAt,
        updatedAt,
        aerodrome: { group: { uf: 'PI' } },
      },
    ]);
    findTasksForMaintenanceIds.mockResolvedValue([
      {
        id: 't1',
        maintenanceId: 'm1',
        status: 'PENDING',
        predictedDate: new Date('2020-01-01T00:00:00.000Z'),
        delayWarning: null,
      },
    ]);

    const result = await service.execute(
      { page: 1, limit: 10 },
      { id: 'admin', email: 'a@t.com', role: UserRole.ADMIN },
    );

    expect(result.data).toHaveLength(1);
    expect(result.data[0].overduePendingCount).toBe(1);
    expect(result.meta.totalItems).toBe(1);
  });
});
