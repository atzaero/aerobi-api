import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { UserRole } from '@/generated/prisma/client';
import type { MaintenanceTask } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { MaintenanceTaskRepository } from '@/modules/tasks/repositories/maintenance-task.repository';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { MaintenanceRepository } from '../repositories/maintenance.repository';

import { StatsMaintenancesService } from './stats-maintenances.service';

/** Simula um `Decimal` do Prisma expondo apenas `toNumber`. */
const decimal = (n: number) =>
  ({ toNumber: () => n }) as unknown as MaintenanceTask['predictedValue'];

describe('StatsMaintenancesService', () => {
  let service: StatsMaintenancesService;
  let countActiveAerodromes: jest.Mock;
  let findMany: jest.Mock;
  let findActiveAerodromeIds: jest.Mock;
  let findTasksForStats: jest.Mock;
  let findActiveById: jest.Mock;

  const admin: AuthenticatedUser = {
    id: 'admin',
    email: 'admin@t.com',
    role: UserRole.ADMIN,
  };
  const coordinator: AuthenticatedUser = {
    id: 'coord',
    email: 'coord@t.com',
    role: UserRole.COORDINATOR,
  };

  beforeEach(() => {
    countActiveAerodromes = jest.fn();
    findMany = jest.fn();
    findActiveAerodromeIds = jest.fn();
    findTasksForStats = jest.fn();
    findActiveById = jest.fn();

    service = new StatsMaintenancesService(
      {
        countActiveAerodromes,
        findMany,
        findActiveAerodromeIds,
      } as unknown as MaintenanceRepository,
      { findTasksForStats } as unknown as MaintenanceTaskRepository,
      { findActiveById } as unknown as UserRepository,
      {
        getMessage: jest.fn((code: string) => code),
      } as unknown as ErrorMessageService,
    );
  });

  it('agrega o dashboard global para ADMIN (escopo all, sem filtrar aeródromos)', async () => {
    countActiveAerodromes.mockResolvedValue(3);
    findMany.mockResolvedValue([{ aerodromeId: 'a1' }]);
    findTasksForStats.mockResolvedValue([
      {
        maintenanceId: 'm1',
        aerodromeId: 'a1',
        investmentType: 'CAPEX',
        predictedValue: decimal(100),
        status: 'PENDING',
        predictedDate: null,
        delayWarning: null,
        urgency: 'HIGH',
      },
    ]);

    const result = await service.execute(admin);

    expect(findActiveById).not.toHaveBeenCalled();
    expect(countActiveAerodromes).toHaveBeenCalledWith({});
    expect(findActiveAerodromeIds).not.toHaveBeenCalled();
    expect(findTasksForStats).toHaveBeenCalledWith(null);
    expect(result).toMatchObject({
      meta: { scopeKind: 'all' },
      aerodromesRegistered: 3,
      aerodromesWithMaintenance: 1,
      totalPredictedValue: 100,
      predictedValueByInvestmentType: { capex: 100, opex: 0 },
      byUrgency: { high: 1 },
      tasksByAerodrome: { a1: 1 },
    });
  });

  it('escopa por grupo do COORDINATOR provisionado', async () => {
    findActiveById.mockResolvedValue({ groupId: 'g1' });
    countActiveAerodromes.mockResolvedValue(2);
    findMany.mockResolvedValue([{ aerodromeId: 'a1' }]);
    findActiveAerodromeIds.mockResolvedValue(['a1']);
    findTasksForStats.mockResolvedValue([]);

    const result = await service.execute(coordinator);

    expect(countActiveAerodromes).toHaveBeenCalledWith({ groupId: 'g1' });
    expect(findActiveAerodromeIds).toHaveBeenCalledWith({ groupId: 'g1' });
    expect(findTasksForStats).toHaveBeenCalledWith(['a1']);
    expect(result.meta.scopeKind).toBe('group');
    expect(result.aerodromesRegistered).toBe(2);
  });

  it('retorna dashboard zerado quando o COORDINATOR não tem grupo (escopo none)', async () => {
    findActiveById.mockResolvedValue({ groupId: null });

    const result = await service.execute(coordinator);

    expect(result.meta.scopeKind).toBe('none');
    expect(result.aerodromesRegistered).toBe(0);
    expect(countActiveAerodromes).not.toHaveBeenCalled();
    expect(findMany).not.toHaveBeenCalled();
  });
});
