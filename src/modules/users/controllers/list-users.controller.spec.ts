import { UserRole } from '@/generated/prisma/client';

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

  it('repassa a query ao service e devolve o resultado paginado', async () => {
    const query: ListUsersQueryDto = {
      page: 1,
      limit: 10,
      role: UserRole.OPERATOR,
    };
    const page = {
      data: [],
      meta: { totalItems: 0 },
    } as unknown as UsersPaginatedResponseDto;
    execute.mockResolvedValue(page);

    await expect(controller.handle(query)).resolves.toBe(page);
    expect(execute).toHaveBeenCalledWith(query);
  });

  // Autorização de list-users permanece ADMIN-only via @Roles + RolesGuard
  // (não migrou para @RequirePermission). A ampliação para COORDINATOR depende
  // do escopo por grupo (epic #204) — ver JSDoc do controller.
});
