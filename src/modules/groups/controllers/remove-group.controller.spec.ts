import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { GroupDeletionResponseDTO } from '../dtos/group-deletion-response.dto';
import { GroupParamDTO } from '../dtos/group-param.dto';
import type { RemoveGroupService } from '../services/remove-group.service';

import { RemoveGroupController } from './remove-group.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

describe('RemoveGroupController', () => {
  let controller: RemoveGroupController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveGroupController({
      execute,
    } as unknown as RemoveGroupService);
  });

  it('delega id e ator (deletedBy real, sem "system")', async () => {
    const params: GroupParamDTO = {
      id: '44444444-4444-4444-8444-444444444444',
    };
    const row = new GroupDeletionResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(params.id, actor);
  });
});
