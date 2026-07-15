import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { MaintenanceTaskRepository } from '@/modules/tasks/repositories/maintenance-task.repository';

import { MaintenanceGuessRepository } from '../repositories/maintenance-guess.repository';

import { ListTaskGuessesService } from './list-task-guesses.service';

describe('ListTaskGuessesService', () => {
  let service: ListTaskGuessesService;
  let findById: jest.Mock;
  let findActiveByTaskId: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    findActiveByTaskId = jest.fn();

    service = new ListTaskGuessesService(
      { findById } as unknown as MaintenanceTaskRepository,
      { findActiveByTaskId } as unknown as MaintenanceGuessRepository,
      {
        getMessage: jest.fn((code: string) => code),
      } as unknown as ErrorMessageService,
    );
  });

  it('lista palpites ativos da tarefa', async () => {
    findById.mockResolvedValue({ id: 'task-1' });
    findActiveByTaskId.mockResolvedValue([
      {
        id: 'g1',
        text: 'Sugestão',
        email: 'a@x.com',
        status: 'PENDING',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);

    const result = await service.execute('task-1', {});

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('pending');
  });

  it('aplica filtro de status', async () => {
    findById.mockResolvedValue({ id: 'task-1' });
    findActiveByTaskId.mockResolvedValue([
      {
        id: 'g1',
        text: 'A',
        email: 'a@x.com',
        status: 'PENDING',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        id: 'g2',
        text: 'B',
        email: 'b@x.com',
        status: 'CONSIDERED',
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
      },
    ]);

    const result = await service.execute('task-1', { status: 'considered' });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('g2');
  });

  it('404 quando a tarefa não existe e não consulta palpites', async () => {
    findById.mockResolvedValue(null);

    await expect(service.execute('missing', {})).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(findActiveByTaskId).not.toHaveBeenCalled();
  });
});
