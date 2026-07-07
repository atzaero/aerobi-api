import { buildMockRequest } from '@/common/testing/http-request.mock';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { CreateTaskDTO } from '../dtos/task.dto';
import type { CreateTaskService } from '../services/create-task.service';

import { CreateTaskController } from './create-task.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@test.com',
  role: UserRole.ADMIN,
};

describe('CreateTaskController', () => {
  let controller: CreateTaskController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest
      .fn()
      .mockResolvedValue({ id: 'task-1', maintenanceId: 'maint-1' });
    controller = new CreateTaskController({
      execute,
    } as unknown as CreateTaskService);
  });

  it('delega DTO/ator e monta o contexto de auditoria do ator', async () => {
    const dto = { maintenanceId: 'maint-1' } as CreateTaskDTO;
    const request = buildMockRequest({ ip: '1.2.3.4', userAgent: 'jest' });

    const result = await controller.handle(dto, actor, request);

    expect(result).toEqual({ id: 'task-1', maintenanceId: 'maint-1' });
    expect(execute).toHaveBeenCalledWith(
      dto,
      actor,
      expect.objectContaining({ actorId: actor.id, ipAddress: '1.2.3.4' }),
    );
  });
});
