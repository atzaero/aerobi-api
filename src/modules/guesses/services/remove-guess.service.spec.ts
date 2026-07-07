import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { AuditAction, GuessStatus, UserRole } from '@/generated/prisma/client';
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

  /**
   * O `before` é afirmado por igualdade profunda (`{ id, status }`): a PII do
   * palpiteiro (`email`/`text`) presente no registro carregado nunca entra na
   * trilha — um vazamento faria o `toHaveBeenCalledWith` falhar.
   */
  it('audita DELETE de guess com before (só id/status) e maintenanceId, sem PII', async () => {
    findById.mockResolvedValue({
      id: 'g1',
      email: 'piloto@example.com',
      text: 'instalar cerca',
      status: GuessStatus.PENDING,
      task: { maintenanceId: 'maint-1' },
    });
    softDelete.mockResolvedValue({ id: 'g1' });
    const auditContext = { ipAddress: '9.9.9.9', userAgent: 'jest' };

    await service.execute('g1', actor, auditContext);

    expect(auditRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.DELETE,
        entityType: 'guess',
        entityId: 'g1',
        before: { id: 'g1', status: GuessStatus.PENDING },
        metadata: { maintenanceId: 'maint-1' },
      }),
      auditContext,
    );
  });

  it('404 quando o palpite não existe: não remove nem audita', async () => {
    findById.mockResolvedValue(null);

    await expect(service.execute('missing', actor)).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(softDelete).not.toHaveBeenCalled();
    expect(auditRecord).not.toHaveBeenCalled();
  });
});
