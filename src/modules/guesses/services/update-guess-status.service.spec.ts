import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { GuessStatus, UserRole } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { MaintenanceGuessRepository } from '../repositories/maintenance-guess.repository';

import { UpdateGuessStatusService } from './update-guess-status.service';

describe('UpdateGuessStatusService', () => {
  const actor: AuthenticatedUser = {
    id: 'actor-1',
    email: 'coord@test.com',
    role: UserRole.COORDINATOR,
  };

  let service: UpdateGuessStatusService;
  let findById: jest.Mock;
  let updateStatus: jest.Mock;
  let auditRecord: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    updateStatus = jest.fn();
    auditRecord = jest.fn();

    service = new UpdateGuessStatusService(
      { findById, updateStatus } as unknown as MaintenanceGuessRepository,
      {
        getMessage: jest.fn((code: string) => code),
      } as unknown as ErrorMessageService,
      { record: auditRecord } as unknown as AuditRecorderService,
    );
  });

  it('atualiza status e retorna maintenanceId', async () => {
    findById.mockResolvedValue({
      id: 'g1',
      status: GuessStatus.PENDING,
      task: { maintenanceId: 'maint-1' },
    });
    updateStatus.mockResolvedValue({
      id: 'g1',
      status: GuessStatus.CONSIDERED,
    });

    const result = await service.execute('g1', { status: 'considered' }, actor);

    expect(result.status).toBe('considered');
    expect(result.maintenanceId).toBe('maint-1');
    expect(auditRecord).toHaveBeenCalled();
  });
});
