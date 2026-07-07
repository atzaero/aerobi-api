import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { MaintenanceTaskRepository } from '@/modules/tasks/repositories/maintenance-task.repository';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { ExportMaintenancesQueryDTO } from '../dtos/export-maintenances-query.dto';
import type { MaintenanceWithAerodrome } from '../repositories/maintenance.repository.interface';
import { MaintenanceRepository } from '../repositories/maintenance.repository';

import { ExportMaintenancesService } from './export-maintenances.service';

/** Plano mínimo com os campos que enrich/export leem. */
const plan = (over: {
  id: string;
  name: string;
  aerodromeId: string;
  uf: string;
  updatedAt: Date;
}): MaintenanceWithAerodrome =>
  ({
    id: over.id,
    name: over.name,
    aerodromeId: over.aerodromeId,
    securityCode: null,
    authorizedEmails: [],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: over.updatedAt,
    aerodrome: { group: { uf: over.uf } },
  }) as unknown as MaintenanceWithAerodrome;

describe('ExportMaintenancesService', () => {
  let service: ExportMaintenancesService;
  let findMany: jest.Mock;
  let findTasksForMaintenanceIds: jest.Mock;
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
    findMany = jest.fn();
    findTasksForMaintenanceIds = jest.fn();
    findActiveById = jest.fn();

    service = new ExportMaintenancesService(
      { findMany } as unknown as MaintenanceRepository,
      {
        findTasksForMaintenanceIds,
      } as unknown as MaintenanceTaskRepository,
      { findActiveById } as unknown as UserRepository,
      {
        getMessage: jest.fn((code: string) => code),
      } as unknown as ErrorMessageService,
    );
  });

  it('exporta CSV ordenado por updatedAt desc para ADMIN', async () => {
    findMany.mockResolvedValue([
      plan({
        id: 'm1',
        name: 'Alpha',
        aerodromeId: 'a1',
        uf: 'PI',
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
      plan({
        id: 'm2',
        name: 'Bravo',
        aerodromeId: 'a2',
        uf: 'SP',
        updatedAt: new Date('2026-06-01T00:00:00.000Z'),
      }),
    ]);
    findTasksForMaintenanceIds.mockResolvedValue([]);

    const query: ExportMaintenancesQueryDTO = {};
    const result = await service.execute(query, admin);

    expect(findMany).toHaveBeenCalledWith({}, 0, 50_000);
    expect(result.total).toBe(2);
    expect(result.truncated).toBe(false);
    expect(result.csv).toContain('Nome da intervenção');
    expect(result.csv.indexOf('Bravo')).toBeLessThan(
      result.csv.indexOf('Alpha'),
    );
  });

  it('aplica o filtro overduePending após enriquecer', async () => {
    findMany.mockResolvedValue([
      plan({
        id: 'm1',
        name: 'Alpha',
        aerodromeId: 'a1',
        uf: 'PI',
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
      plan({
        id: 'm2',
        name: 'Bravo',
        aerodromeId: 'a2',
        uf: 'SP',
        updatedAt: new Date('2026-06-01T00:00:00.000Z'),
      }),
    ]);
    findTasksForMaintenanceIds.mockResolvedValue([
      {
        maintenanceId: 'm1',
        status: 'PENDING',
        predictedDate: new Date('2020-01-01T00:00:00.000Z'),
        delayWarning: null,
      },
    ]);

    const query: ExportMaintenancesQueryDTO = { overduePending: true };
    const result = await service.execute(query, admin);

    expect(result.total).toBe(1);
    expect(result.csv).toContain('Alpha');
    expect(result.csv).not.toContain('Bravo');
  });

  it('escopo none (COORDINATOR sem grupo) consulta where impossível e exporta vazio', async () => {
    findActiveById.mockResolvedValue({ groupId: null });
    findMany.mockResolvedValue([]);
    findTasksForMaintenanceIds.mockResolvedValue([]);

    const query: ExportMaintenancesQueryDTO = {};
    const result = await service.execute(query, coordinator);

    expect(findMany).toHaveBeenCalledWith({ id: { in: [] } }, 0, 50_000);
    expect(result.total).toBe(0);
    expect(result.truncated).toBe(false);
  });
});
