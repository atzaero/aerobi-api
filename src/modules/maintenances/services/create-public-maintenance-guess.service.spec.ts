import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { MaintenanceGuessRepository } from '@/modules/guesses/repositories/maintenance-guess.repository';
import { MaintenanceTaskRepository } from '@/modules/tasks/repositories/maintenance-task.repository';

import { MaintenanceRepository } from '../repositories/maintenance.repository';

import { CreatePublicMaintenanceGuessService } from './create-public-maintenance-guess.service';

describe('CreatePublicMaintenanceGuessService', () => {
  let service: CreatePublicMaintenanceGuessService;
  let findMaintenanceById: jest.Mock;
  let findTaskById: jest.Mock;
  let create: jest.Mock;

  beforeEach(() => {
    findMaintenanceById = jest.fn();
    findTaskById = jest.fn();
    create = jest.fn();

    service = new CreatePublicMaintenanceGuessService(
      { findById: findMaintenanceById } as unknown as MaintenanceRepository,
      { findById: findTaskById } as unknown as MaintenanceTaskRepository,
      { create } as unknown as MaintenanceGuessRepository,
      {
        getMessage: jest.fn((code: string) => code),
      } as unknown as ErrorMessageService,
    );
  });

  it('rejeita securityCode incorreto com 401', async () => {
    findTaskById.mockResolvedValue({
      id: 'task-1',
      maintenanceId: 'maint-1',
    });
    findMaintenanceById.mockResolvedValue({
      id: 'maint-1',
      securityCode: 'CORRECT1',
      authorizedEmails: ['a@x.com'],
    });

    await expect(
      service.execute('maint-1', {
        taskId: 'task-1',
        email: 'a@x.com',
        text: 'Sugestão',
        securityCode: 'WRONG123',
      }),
    ).rejects.toMatchObject({
      errorCode: ErrorCode.UNAUTHORIZED,
      status: HttpStatus.UNAUTHORIZED,
    } satisfies Partial<CustomHttpException>);
  });

  it('cria palpite quando code e e-mail são válidos', async () => {
    findTaskById.mockResolvedValue({
      id: 'task-1',
      maintenanceId: 'maint-1',
    });
    findMaintenanceById.mockResolvedValue({
      id: 'maint-1',
      securityCode: 'CORRECT1',
      authorizedEmails: ['A@x.com'],
    });
    create.mockResolvedValue({ id: 'g1', taskId: 'task-1' });

    const result = await service.execute('maint-1', {
      taskId: 'task-1',
      email: 'a@x.com',
      text: 'Sugestão',
      securityCode: 'CORRECT1',
    });

    expect(result.id).toBe('g1');
    expect(create).toHaveBeenCalled();
  });

  it('rejeita e-mail fora da lista autorizada com 401', async () => {
    findMaintenanceById.mockResolvedValue({
      id: 'maint-1',
      securityCode: 'CORRECT1',
      authorizedEmails: ['a@x.com'],
    });

    await expect(
      service.execute('maint-1', {
        taskId: 'task-1',
        email: 'intruso@x.com',
        text: 'Sugestão',
        securityCode: 'CORRECT1',
      }),
    ).rejects.toMatchObject({
      errorCode: ErrorCode.UNAUTHORIZED,
      status: HttpStatus.UNAUTHORIZED,
    } satisfies Partial<CustomHttpException>);
    expect(create).not.toHaveBeenCalled();
  });

  it('retorna 404 quando a intervenção não tem acesso público', async () => {
    findMaintenanceById.mockResolvedValue({
      id: 'maint-1',
      securityCode: 'CORRECT1',
      authorizedEmails: [],
    });

    await expect(
      service.execute('maint-1', {
        taskId: 'task-1',
        email: 'a@x.com',
        text: 'Sugestão',
        securityCode: 'CORRECT1',
      }),
    ).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
  });

  it('retorna 404 quando a intervenção não existe', async () => {
    findMaintenanceById.mockResolvedValue(null);

    await expect(
      service.execute('missing', {
        taskId: 'task-1',
        email: 'a@x.com',
        text: 'Sugestão',
        securityCode: 'CORRECT1',
      }),
    ).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
  });

  it('retorna 404 quando a tarefa é de outra intervenção', async () => {
    findMaintenanceById.mockResolvedValue({
      id: 'maint-1',
      securityCode: 'CORRECT1',
      authorizedEmails: ['a@x.com'],
    });
    findTaskById.mockResolvedValue({
      id: 'task-1',
      maintenanceId: 'outra-maint',
    });

    await expect(
      service.execute('maint-1', {
        taskId: 'task-1',
        email: 'a@x.com',
        text: 'Sugestão',
        securityCode: 'CORRECT1',
      }),
    ).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    expect(create).not.toHaveBeenCalled();
  });

  it('retorna 404 quando a tarefa não existe', async () => {
    findMaintenanceById.mockResolvedValue({
      id: 'maint-1',
      securityCode: 'CORRECT1',
      authorizedEmails: ['a@x.com'],
    });
    findTaskById.mockResolvedValue(null);

    await expect(
      service.execute('maint-1', {
        taskId: 'task-1',
        email: 'a@x.com',
        text: 'Sugestão',
        securityCode: 'CORRECT1',
      }),
    ).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
  });
});
