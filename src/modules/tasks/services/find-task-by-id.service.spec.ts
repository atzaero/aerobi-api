import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { MaintenanceTask } from '@/generated/prisma/client';

import type { MaintenanceTaskRepository } from '../repositories/maintenance-task.repository';

import { FindTaskByIdService } from './find-task-by-id.service';

const TASK_ID = '11111111-1111-4111-8111-111111111111';

function entity(): MaintenanceTask {
  return {
    id: TASK_ID,
    maintenanceId: 'maint-1',
    title: 'Trocar lâmpadas',
    description: 'Descrição',
    predictedValue: { toNumber: () => 1000 },
    insertionDate: new Date('2026-01-01T00:00:00.000Z'),
    predictedDate: new Date('2026-02-01T00:00:00.000Z'),
    completionDate: null,
    actualCost: null,
    completionDescription: null,
    impact: null,
    timeElapsed: null,
    status: 'PENDING',
    urgency: null,
    followUp: null,
    investmentType: null,
    responsibility: null,
    delayWarning: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  } as unknown as MaintenanceTask;
}

describe('FindTaskByIdService', () => {
  let service: FindTaskByIdService;
  let findById: jest.Mock;
  let countActiveGuessesByTaskIds: jest.Mock;

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue(entity());
    countActiveGuessesByTaskIds = jest
      .fn()
      .mockResolvedValue(new Map([[TASK_ID, 3]]));

    service = new FindTaskByIdService(
      {
        findById,
        countActiveGuessesByTaskIds,
      } as unknown as MaintenanceTaskRepository,
      {
        getMessage: jest.fn((code: string) => code),
      } as unknown as ErrorMessageService,
    );
  });

  it('devolve a tarefa mapeada com suggestionCount da contagem', async () => {
    const result = await service.execute(TASK_ID);

    expect(result.id).toBe(TASK_ID);
    expect(result.title).toBe('Trocar lâmpadas');
    expect(countActiveGuessesByTaskIds).toHaveBeenCalledWith([TASK_ID]);
    expect(result.suggestionCount).toBe(3);
  });

  it('omite suggestionCount quando a contagem não traz o id', async () => {
    countActiveGuessesByTaskIds.mockResolvedValue(new Map());

    const result = await service.execute(TASK_ID);

    expect(result.suggestionCount).toBeUndefined();
  });

  it('tarefa inexistente → 404, não conta sugestões', async () => {
    findById.mockResolvedValue(null);

    await expect(service.execute(TASK_ID)).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(countActiveGuessesByTaskIds).not.toHaveBeenCalled();
  });
});
