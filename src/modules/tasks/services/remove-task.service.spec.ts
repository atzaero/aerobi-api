import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { AuditAction, UserRole } from '@/generated/prisma/client';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { MaintenanceTaskRepository } from '../repositories/maintenance-task.repository';

import { RemoveTaskService } from './remove-task.service';

const TASK_ID = '11111111-1111-4111-8111-111111111111';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@test.com',
  role: UserRole.ADMIN,
};

describe('RemoveTaskService', () => {
  let service: RemoveTaskService;
  let findById: jest.Mock;
  let softDelete: jest.Mock;
  let record: jest.Mock;

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue({
      id: TASK_ID,
      title: 'Trocar lâmpadas',
      maintenanceId: 'maint-1',
    });
    softDelete = jest.fn().mockResolvedValue({
      task: { id: TASK_ID },
      deletedGuesses: 3,
    });
    record = jest.fn().mockResolvedValue(undefined);

    service = new RemoveTaskService(
      { findById, softDelete } as unknown as MaintenanceTaskRepository,
      {
        getMessage: jest.fn((code: string) => code),
      } as unknown as ErrorMessageService,
      { record } as unknown as AuditRecorderService,
    );
  });

  it('soft-delete devolve o id e delega ao repositório com o ator', async () => {
    const result = await service.execute(TASK_ID, actor);

    expect(result.id).toBe(TASK_ID);
    expect(softDelete).toHaveBeenCalledWith(TASK_ID, actor.id);
  });

  it('grava auditoria DELETE com before e cascade dos guesses no metadata', async () => {
    await service.execute(TASK_ID, actor, { ipAddress: '10.0.0.1' });

    expect(record).toHaveBeenCalledWith(
      {
        action: AuditAction.DELETE,
        entityType: 'task',
        entityId: TASK_ID,
        before: { id: TASK_ID, title: 'Trocar lâmpadas' },
        metadata: { maintenanceId: 'maint-1', cascadedGuesses: 3 },
      },
      { ipAddress: '10.0.0.1' },
    );
  });

  it('propaga a contagem de guesses cascateados devolvida pelo softDelete', async () => {
    softDelete.mockResolvedValue({ task: { id: TASK_ID }, deletedGuesses: 0 });

    await service.execute(TASK_ID, actor);

    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { maintenanceId: 'maint-1', cascadedGuesses: 0 },
      }),
      expect.anything(),
    );
  });

  it('tarefa inexistente → 404, não remove nem audita', async () => {
    findById.mockResolvedValue(null);

    await expect(service.execute(TASK_ID, actor)).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(softDelete).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
  });
});
