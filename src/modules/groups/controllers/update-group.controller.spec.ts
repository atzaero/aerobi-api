import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { GroupParamDTO } from '../dtos/group-param.dto';
import { GroupResponseDTO } from '../dtos/group-response.dto';
import { UpdateGroupDTO } from '../dtos/update-group.dto';
import type { UpdateGroupService } from '../services/update-group.service';

import { UpdateGroupController } from './update-group.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

describe('UpdateGroupController', () => {
  let controller: UpdateGroupController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateGroupController({
      execute,
    } as unknown as UpdateGroupService);
  });

  it('delega id, body e ator ao service', async () => {
    const params: GroupParamDTO = {
      id: '44444444-4444-4444-8444-444444444444',
    };
    const body: UpdateGroupDTO = { name: 'X' };
    const row = new GroupResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, body, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(params.id, body, actor);
  });
});
