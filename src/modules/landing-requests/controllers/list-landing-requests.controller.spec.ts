import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { ListLandingRequestsQueryDTO } from '../dtos/list-landing-requests-query.dto';
import type { ListLandingRequestsService } from '../services/list-landing-requests.service';
import { ListLandingRequestsController } from './list-landing-requests.controller';

describe('ListLandingRequestsController', () => {
  let controller: ListLandingRequestsController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'a',
    email: 'a@x',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListLandingRequestsController({
      execute,
    } as unknown as ListLandingRequestsService);
  });

  it('delega a query e o ator ao service', async () => {
    const query = { page: 1 } as ListLandingRequestsQueryDTO;
    const result = { data: [] };
    execute.mockResolvedValue(result);
    await expect(controller.handle(query, actor)).resolves.toBe(result);
    expect(execute).toHaveBeenCalledWith(query, actor);
  });
});
