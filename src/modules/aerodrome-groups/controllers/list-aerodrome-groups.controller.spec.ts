import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeGroupsPaginatedResponseDTO } from '../dtos/aerodrome-groups-paginated-response.dto';
import type { ListAerodromeGroupsService } from '../services/list-aerodrome-groups.service';

import { ListAerodromeGroupsController } from './list-aerodrome-groups.controller';

const actor: AuthenticatedUser = {
  id: 'admin-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

describe('ListAerodromeGroupsController', () => {
  let controller: ListAerodromeGroupsController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListAerodromeGroupsController({
      execute,
    } as unknown as ListAerodromeGroupsService);
  });

  it('delega passando query e ator', async () => {
    const q = { page: 1 };
    const p = new AerodromeGroupsPaginatedResponseDTO([], 1, 10, 0);
    execute.mockResolvedValue(p);
    await expect(controller.handle(q, actor)).resolves.toBe(p);
    expect(execute).toHaveBeenCalledWith(q, actor);
  });
});
