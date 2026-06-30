import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { GroupsPaginatedResponseDTO } from '../dtos/groups-paginated-response.dto';
import type { ListGroupsService } from '../services/list-groups.service';

import { ListGroupsController } from './list-groups.controller';

const actor: AuthenticatedUser = {
  id: 'admin-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

describe('ListGroupsController', () => {
  let controller: ListGroupsController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListGroupsController({
      execute,
    } as unknown as ListGroupsService);
  });

  it('delega passando query e ator', async () => {
    const q = { page: 1 };
    const p = new GroupsPaginatedResponseDTO([], 1, 10, 0);
    execute.mockResolvedValue(p);
    await expect(controller.handle(q, actor)).resolves.toBe(p);
    expect(execute).toHaveBeenCalledWith(q, actor);
  });
});
