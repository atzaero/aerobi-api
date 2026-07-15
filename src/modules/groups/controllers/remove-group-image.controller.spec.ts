import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { GroupParamDTO } from '../dtos/group-param.dto';
import { GroupResponseDTO } from '../dtos/group-response.dto';
import type { RemoveGroupImageService } from '../services/remove-group-image.service';

import { RemoveGroupImageController } from './remove-group-image.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

describe('RemoveGroupImageController', () => {
  let controller: RemoveGroupImageController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveGroupImageController({
      execute,
    } as unknown as RemoveGroupImageService);
  });

  it('delega id e ator ao service', async () => {
    const params: GroupParamDTO = {
      id: '44444444-4444-4444-8444-444444444444',
    };
    const row = new GroupResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(params.id, actor);
  });
});
