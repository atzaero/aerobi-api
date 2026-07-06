import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { UserRole } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { MaintenanceGuessRepository } from '../repositories/maintenance-guess.repository';

import { RemoveGuessService } from './remove-guess.service';

describe('RemoveGuessService', () => {
  const actor: AuthenticatedUser = {
    id: 'actor-1',
    email: 'admin@test.com',
    role: UserRole.ADMIN,
  };

  let service: RemoveGuessService;
  let findById: jest.Mock;
  let softDelete: jest.Mock;
  let auditRecord: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    softDelete = jest.fn();
    auditRecord = jest.fn();

    service = new RemoveGuessService(
      { findById, softDelete } as unknown as MaintenanceGuessRepository,
      {
        getMessage: jest.fn((code: string) => code),
      } as unknown as ErrorMessageService,
      { record: auditRecord } as unknown as AuditRecorderService,
    );
  });

  it('soft-delete retorna maintenanceId', async () => {
    findById.mockResolvedValue({
      id: 'g1',
      email: 'a@x.com',
      task: { maintenanceId: 'maint-1' },
    });
    softDelete.mockResolvedValue({ id: 'g1' });

    const result = await service.execute('g1', actor);

    expect(result.id).toBe('g1');
    expect(result.maintenanceId).toBe('maint-1');
    expect(softDelete).toHaveBeenCalledWith('g1', actor.id);
  });
});
