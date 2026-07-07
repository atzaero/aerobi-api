import { buildMockRequest } from '@/common/testing/http-request.mock';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { TaskParamDTO } from '../dtos/task-param.dto';
import type { RemoveTaskService } from '../services/remove-task.service';

import { RemoveTaskController } from './remove-task.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@test.com',
  role: UserRole.ADMIN,
};

describe('RemoveTaskController', () => {
  let controller: RemoveTaskController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveTaskController({
      execute,
    } as unknown as RemoveTaskService);
  });

  it('delega id/ator e monta o contexto de auditoria do ator', async () => {
    const params: TaskParamDTO = {
      id: '11111111-1111-4111-8111-111111111111',
    };
    const request = buildMockRequest({ userAgent: 'jest' });
    const row = { id: params.id };
    execute.mockResolvedValue(row);

    await expect(controller.handle(params, actor, request)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(
      params.id,
      actor,
      expect.objectContaining({ actorId: actor.id }),
    );
  });
});
