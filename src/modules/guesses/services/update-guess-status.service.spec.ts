import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { AuditAction, GuessStatus, UserRole } from '@/generated/prisma/client';
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
    expect(auditRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.UPDATE,
        entityType: 'guess',
        entityId: 'g1',
        before: { id: 'g1', status: GuessStatus.PENDING },
        after: { id: 'g1', status: GuessStatus.CONSIDERED },
        metadata: { scope: 'moderate', maintenanceId: 'maint-1' },
      }),
      {},
    );
  });

  it('converte o status da API (dismissed) para o enum ao persistir', async () => {
    findById.mockResolvedValue({
      id: 'g1',
      status: GuessStatus.PENDING,
      task: { maintenanceId: 'maint-1' },
    });
    updateStatus.mockResolvedValue({
      id: 'g1',
      status: GuessStatus.DISMISSED,
    });

    const result = await service.execute('g1', { status: 'dismissed' }, actor);

    expect(updateStatus).toHaveBeenCalledWith(
      'g1',
      GuessStatus.DISMISSED,
      actor.id,
    );
    expect(result.status).toBe('dismissed');
  });

  it('repassa o contexto de auditoria recebido do controller', async () => {
    findById.mockResolvedValue({
      id: 'g1',
      status: GuessStatus.PENDING,
      task: { maintenanceId: 'maint-1' },
    });
    updateStatus.mockResolvedValue({
      id: 'g1',
      status: GuessStatus.CONSIDERED,
    });
    const auditContext = { ipAddress: '1.2.3.4', userAgent: 'jest' };

    await service.execute('g1', { status: 'considered' }, actor, auditContext);

    expect(auditRecord).toHaveBeenCalledWith(expect.anything(), auditContext);
  });

  it('404 quando o palpite não existe: não atualiza nem audita', async () => {
    findById.mockResolvedValue(null);

    await expect(
      service.execute('missing', { status: 'considered' }, actor),
    ).rejects.toBeInstanceOf(CustomHttpException);
    expect(updateStatus).not.toHaveBeenCalled();
    expect(auditRecord).not.toHaveBeenCalled();
  });
});
