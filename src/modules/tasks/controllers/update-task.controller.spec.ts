import { buildMockRequest } from '@/common/testing/http-request.mock';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { TaskParamDTO } from '../dtos/task-param.dto';
import type { UpdateTaskDTO } from '../dtos/task.dto';
import type { UpdateTaskService } from '../services/update-task.service';

import { UpdateTaskController } from './update-task.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@test.com',
  role: UserRole.ADMIN,
};

describe('UpdateTaskController', () => {
  let controller: UpdateTaskController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateTaskController({
      execute,
    } as unknown as UpdateTaskService);
  });

  it('delega id/DTO/ator e monta o contexto de auditoria do ator', async () => {
    const params: TaskParamDTO = {
      id: '11111111-1111-4111-8111-111111111111',
    };
    const dto = { title: 'Novo título' } as UpdateTaskDTO;
    const request = buildMockRequest({ userAgent: 'jest' });
    const row = { id: params.id };
    execute.mockResolvedValue(row);

    await expect(controller.handle(params, dto, actor, request)).resolves.toBe(
      row,
    );
    expect(execute).toHaveBeenCalledWith(
      params.id,
      dto,
      actor,
      expect.objectContaining({ actorId: actor.id }),
    );
  });
});
