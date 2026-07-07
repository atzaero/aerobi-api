import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { AuditAction, UserRole } from '@/generated/prisma/client';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { MaintenanceRepository } from '@/modules/maintenances/repositories/maintenance.repository';

import type { CreateTaskDTO } from '../dtos/task.dto';
import type { MaintenanceTaskRepository } from '../repositories/maintenance-task.repository';

import { CreateTaskService } from './create-task.service';

const MAINTENANCE_ID = '11111111-1111-4111-8111-111111111111';
const TASK_ID = '22222222-2222-4222-8222-222222222222';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@test.com',
  role: UserRole.ADMIN,
};

function buildDto(overrides: Partial<CreateTaskDTO> = {}): CreateTaskDTO {
  return {
    maintenanceId: MAINTENANCE_ID,
    title: 'Trocar lâmpadas',
    description: 'Substituir lâmpadas do pátio',
    predictedValue: 1000,
    insertionDate: '2026-01-01T00:00:00.000Z',
    predictedDate: '2026-02-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('CreateTaskService', () => {
  let service: CreateTaskService;
  let maintenanceFindById: jest.Mock;
  let create: jest.Mock;
  let record: jest.Mock;

  beforeEach(() => {
    maintenanceFindById = jest
      .fn()
      .mockResolvedValue({ id: MAINTENANCE_ID, aerodromeId: 'aero-1' });
    create = jest.fn().mockResolvedValue({
      id: TASK_ID,
      maintenanceId: MAINTENANCE_ID,
      title: 'Trocar lâmpadas',
    });
    record = jest.fn().mockResolvedValue(undefined);

    service = new CreateTaskService(
      {
        findById: maintenanceFindById,
      } as unknown as MaintenanceRepository,
      { create } as unknown as MaintenanceTaskRepository,
      {
        getMessage: jest.fn((code: string) => code),
      } as unknown as ErrorMessageService,
      { record } as unknown as AuditRecorderService,
    );
  });

  it('cria a tarefa e devolve { id, maintenanceId }', async () => {
    const result = await service.execute(buildDto(), actor);

    expect(result.id).toBe(TASK_ID);
    expect(result.maintenanceId).toBe(MAINTENANCE_ID);
  });

  it('persiste com a manutenção conectada e o ator em createdBy/updatedBy', async () => {
    await service.execute(buildDto(), actor);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        maintenance: { connect: { id: MAINTENANCE_ID } },
        createdBy: actor.id,
        updatedBy: actor.id,
        title: 'Trocar lâmpadas',
      }),
    );
  });

  it('grava auditoria CREATE com aerodromeId da manutenção no metadata', async () => {
    await service.execute(buildDto(), actor, { userAgent: 'jest' });

    expect(record).toHaveBeenCalledWith(
      {
        action: AuditAction.CREATE,
        entityType: 'task',
        entityId: TASK_ID,
        after: {
          id: TASK_ID,
          maintenanceId: MAINTENANCE_ID,
          title: 'Trocar lâmpadas',
        },
        metadata: { aerodromeId: 'aero-1' },
      },
      { userAgent: 'jest' },
    );
  });

  it('manutenção-mãe inexistente → 404, não cria nem audita', async () => {
    maintenanceFindById.mockResolvedValue(null);

    await expect(service.execute(buildDto(), actor)).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(create).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
  });
});
