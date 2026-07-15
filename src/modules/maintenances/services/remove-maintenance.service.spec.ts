import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { UserRole } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { MaintenanceRepository } from '../repositories/maintenance.repository';

import { RemoveMaintenanceService } from './remove-maintenance.service';

describe('RemoveMaintenanceService', () => {
  const actor: AuthenticatedUser = {
    id: 'actor-1',
    email: 'admin@test.com',
    role: UserRole.ADMIN,
  };

  let service: RemoveMaintenanceService;
  let findById: jest.Mock;
  let softDeleteWithTasks: jest.Mock;
  let auditRecord: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    softDeleteWithTasks = jest.fn();
    auditRecord = jest.fn();

    service = new RemoveMaintenanceService(
      { findById, softDeleteWithTasks } as unknown as MaintenanceRepository,
      {
        getMessage: jest.fn((code: string) => code),
      } as unknown as ErrorMessageService,
      { record: auditRecord } as unknown as AuditRecorderService,
    );
  });

  it('soft-deleta intervenção e tarefas em cascata', async () => {
    findById.mockResolvedValue({
      id: 'm1',
      aerodromeId: 'a1',
      name: 'Plano',
      authorizedEmails: [],
      aerodrome: { group: { uf: 'PI' } },
    });
    softDeleteWithTasks.mockResolvedValue({ deletedTasks: 3 });

    const result = await service.execute('m1', actor);

    expect(result).toEqual({ id: 'm1', deletedTasks: 3 });
    expect(softDeleteWithTasks).toHaveBeenCalledWith('m1', actor.id);
    expect(auditRecord).toHaveBeenCalled();
  });

  it('retorna 404 quando intervenção não existe', async () => {
    findById.mockResolvedValue(null);

    await expect(service.execute('missing', actor)).rejects.toMatchObject({
      status: 404,
    });
  });
});
