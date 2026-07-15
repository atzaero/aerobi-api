import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { MaintenanceTask } from '@/generated/prisma/client';
import type { MaintenanceRepository } from '@/modules/maintenances/repositories/maintenance.repository';

import type { ListTasksQueryDTO } from '../dtos/list-tasks-query.dto';
import type { MaintenanceTaskRepository } from '../repositories/maintenance-task.repository';

import { ListTasksService } from './list-tasks.service';

const MAINTENANCE_ID = '11111111-1111-4111-8111-111111111111';

/**
 * MaintenanceTask completo o suficiente para atravessar filtro, ordenação e o
 * mapper de resposta (que chama `toISOString()` nas datas e `toNumber()` no
 * Decimal). `urgency` nulo em todos mantém a ordenação estável por
 * `predictedDate` ascendente.
 */
function task(
  id: string,
  overrides: Partial<Record<string, unknown>> = {},
): MaintenanceTask {
  const day = Number(id.replace(/\D/g, '')) || 1;
  return {
    id,
    maintenanceId: MAINTENANCE_ID,
    title: `Tarefa ${id}`,
    description: 'Descrição',
    predictedValue: { toNumber: () => 1000 },
    insertionDate: new Date('2026-01-01T00:00:00.000Z'),
    predictedDate: new Date(2026, 0, day),
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
    ...overrides,
  } as unknown as MaintenanceTask;
}

function buildQuery(
  overrides: Partial<ListTasksQueryDTO> = {},
): ListTasksQueryDTO {
  return { maintenanceId: MAINTENANCE_ID, ...overrides };
}

describe('ListTasksService', () => {
  let service: ListTasksService;
  let maintenanceFindById: jest.Mock;
  let findManyByMaintenanceId: jest.Mock;
  let countActiveGuessesByTaskIds: jest.Mock;

  beforeEach(() => {
    maintenanceFindById = jest
      .fn()
      .mockResolvedValue({ id: MAINTENANCE_ID, aerodromeId: 'aero-1' });
    findManyByMaintenanceId = jest.fn();
    countActiveGuessesByTaskIds = jest.fn().mockResolvedValue(new Map());

    service = new ListTasksService(
      {
        findById: maintenanceFindById,
      } as unknown as MaintenanceRepository,
      {
        findManyByMaintenanceId,
        countActiveGuessesByTaskIds,
      } as unknown as MaintenanceTaskRepository,
      {
        getMessage: jest.fn((code: string) => code),
      } as unknown as ErrorMessageService,
    );
  });

  it('pagina sobre o conjunto ordenado e devolve meta coerente', async () => {
    const tasks = ['1', '2', '3', '4', '5'].map((n) => task(`t${n}`));
    findManyByMaintenanceId.mockResolvedValue(tasks);

    const result = await service.execute(buildQuery({ page: 2, limit: 2 }));

    expect(result.data).toHaveLength(2);
    expect(result.data.map((t) => t.id)).toEqual(['t3', 't4']);
    expect(result.meta.currentPage).toBe(2);
    expect(result.meta.itemsPerPage).toBe(2);
    expect(result.meta.totalItems).toBe(5);
    expect(result.meta.totalPages).toBe(3);
    expect(result.meta.hasNextPage).toBe(true);
    expect(result.meta.hasPreviousPage).toBe(true);
  });

  it('conta sugestões pelos ids das tarefas e injeta suggestionCount', async () => {
    const tasks = [task('t1'), task('t2')];
    findManyByMaintenanceId.mockResolvedValue(tasks);
    countActiveGuessesByTaskIds.mockResolvedValue(
      new Map([
        ['t1', 4],
        ['t2', 0],
      ]),
    );

    const result = await service.execute(buildQuery());

    expect(countActiveGuessesByTaskIds).toHaveBeenCalledWith(['t1', 't2']);
    const byId = new Map(result.data.map((t) => [t.id, t.suggestionCount]));
    expect(byId.get('t1')).toBe(4);
    expect(byId.get('t2')).toBe(0);
  });

  it('total reflete o conjunto FILTRADO, não o bruto', async () => {
    const tasks = [
      task('t1', { title: 'Pintar pista' }),
      task('t2', { title: 'Trocar lâmpadas' }),
      task('t3', { title: 'Podar grama' }),
    ];
    findManyByMaintenanceId.mockResolvedValue(tasks);

    const result = await service.execute(buildQuery({ search: 'lâmpadas' }));

    expect(result.meta.totalItems).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('t2');
  });

  it('manutenção-mãe inexistente → 404, não consulta tarefas', async () => {
    maintenanceFindById.mockResolvedValue(null);

    await expect(service.execute(buildQuery())).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(findManyByMaintenanceId).not.toHaveBeenCalled();
  });
});
