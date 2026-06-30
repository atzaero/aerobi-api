import { Uf, UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { GroupResponseDTO } from '../dtos/group-response.dto';
import { CreateGroupDTO } from '../dtos/create-group.dto';
import type { CreateGroupService } from '../services/create-group.service';

import { CreateGroupController } from './create-group.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

describe('CreateGroupController', () => {
  let controller: CreateGroupController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateGroupController({
      execute,
    } as unknown as CreateGroupService);
  });

  it('delega passando o ator autenticado', async () => {
    const dto: CreateGroupDTO = {
      uf: Uf.SP,
      name: 'G',
    };
    const row = new GroupResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(dto, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(dto, actor);
  });
});
