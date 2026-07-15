import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { ListUsersQueryDto } from '../dtos/list-users-query.dto';
import type { UsersPaginatedResponseDto } from '../dtos/users-paginated-response.dto';
import type { ListUsersService } from '../services/list-users.service';

import { ListUsersController } from './list-users.controller';

describe('ListUsersController', () => {
  let controller: ListUsersController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListUsersController({
      execute,
    } as unknown as ListUsersService);
  });

  it('repassa a query e o ator ao service e devolve o resultado paginado', async () => {
    const query: ListUsersQueryDto = {
      page: 1,
      limit: 10,
      role: UserRole.OPERATOR,
    };
    const actor: AuthenticatedUser = {
      id: 'admin-1',
      email: 'admin@aerobi.local',
      role: UserRole.ADMIN,
    };
    const page = {
      data: [],
      meta: { totalItems: 0 },
    } as unknown as UsersPaginatedResponseDto;
    execute.mockResolvedValue(page);

    await expect(controller.handle(query, actor)).resolves.toBe(page);
    expect(execute).toHaveBeenCalledWith(query, actor);
  });

  // Autorização de list-users: @RequirePermission('user','list') (ADMIN/COORDINATOR).
  // O escopo por grupo (COORDINATOR restrito ao próprio grupo) é aplicado no
  // service (list-users.service.spec) — ver JSDoc do controller.
});
