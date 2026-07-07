import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { AuditAction, UserRole } from '@/generated/prisma/client';
import type { MaintenanceTask } from '@/generated/prisma/client';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { MaintenanceRepository } from '@/modules/maintenances/repositories/maintenance.repository';

import type { UpdateTaskDTO } from '../dtos/task.dto';
import type { MaintenanceTaskRepository } from '../repositories/maintenance-task.repository';

import { UpdateTaskService } from './update-task.service';

const TASK_ID = '11111111-1111-4111-8111-111111111111';
const MAINTENANCE_ID = '22222222-2222-4222-8222-222222222222';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@test.com',
  role: UserRole.ADMIN,
};

function buildDto(overrides: Partial<UpdateTaskDTO> = {}): UpdateTaskDTO {
  return {
    title: 'Título novo',
    description: 'Descrição nova',
    predictedValue: 2000,
    insertionDate: '2026-01-01T00:00:00.000Z',
    predictedDate: '2026-02-01T00:00:00.000Z',
    ...overrides,
  };
}

function updatedEntity(
  overrides: Partial<Record<string, unknown>> = {},
): MaintenanceTask {
  return {
    id: TASK_ID,
    maintenanceId: MAINTENANCE_ID,
    title: 'Título novo',
    description: 'Descrição nova',
    predictedValue: { toNumber: () => 2000 },
    insertionDate: new Date('2026-01-01T00:00:00.000Z'),
    predictedDate: new Date('2026-02-01T00:00:00.000Z'),
    completionDate: null,
    actualCost: null,
    completionDescription: null,
    impact: null,
    timeElapsed: null,
    status: 'COMPLETED',
    urgency: null,
    followUp: null,
    investmentType: null,
    responsibility: null,
    delayWarning: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-05T00:00:00.000Z'),
    ...overrides,
  } as unknown as MaintenanceTask;
}

describe('UpdateTaskService', () => {
  let service: UpdateTaskService;
  let findById: jest.Mock;
  let update: jest.Mock;
  let maintenanceFindById: jest.Mock;
  let record: jest.Mock;

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue({
      id: TASK_ID,
      title: 'Título antigo',
      status: 'PENDING',
      maintenanceId: MAINTENANCE_ID,
    });
    update = jest.fn().mockResolvedValue(updatedEntity());
    maintenanceFindById = jest
      .fn()
      .mockResolvedValue({ id: MAINTENANCE_ID, aerodromeId: 'aero-1' });
    record = jest.fn().mockResolvedValue(undefined);

    service = new UpdateTaskService(
      {
        findById,
        update,
      } as unknown as MaintenanceTaskRepository,
      {
        findById: maintenanceFindById,
      } as unknown as MaintenanceRepository,
      {
        getMessage: jest.fn((code: string) => code),
      } as unknown as ErrorMessageService,
      { record } as unknown as AuditRecorderService,
    );
  });

  it('devolve a tarefa atualizada mapeada e persiste com o ator', async () => {
    const result = await service.execute(TASK_ID, buildDto(), actor);

    expect(result.id).toBe(TASK_ID);
    expect(result.status).toBe('completed');
    expect(update).toHaveBeenCalledWith(
      TASK_ID,
      expect.objectContaining({ updatedBy: actor.id, title: 'Título novo' }),
    );
  });

  it('grava auditoria UPDATE com before/after e aerodromeId no metadata', async () => {
    await service.execute(TASK_ID, buildDto(), actor, { ipAddress: '1.2.3.4' });

    expect(record).toHaveBeenCalledWith(
      {
        action: AuditAction.UPDATE,
        entityType: 'task',
        entityId: TASK_ID,
        before: { id: TASK_ID, title: 'Título antigo', status: 'PENDING' },
        after: { id: TASK_ID, title: 'Título novo', status: 'COMPLETED' },
        metadata: { maintenanceId: MAINTENANCE_ID, aerodromeId: 'aero-1' },
      },
      { ipAddress: '1.2.3.4' },
    );
  });

  it('manutenção não encontrada deixa aerodromeId indefinido no metadata', async () => {
    maintenanceFindById.mockResolvedValue(null);

    await service.execute(TASK_ID, buildDto(), actor);

    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { maintenanceId: MAINTENANCE_ID, aerodromeId: undefined },
      }),
      expect.anything(),
    );
  });

  it('tarefa inexistente → 404, não atualiza nem audita', async () => {
    findById.mockResolvedValue(null);

    await expect(
      service.execute(TASK_ID, buildDto(), actor),
    ).rejects.toBeInstanceOf(CustomHttpException);
    expect(update).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
  });
});
