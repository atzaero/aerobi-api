import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { PendingCountLandingRequestsService } from '../services/pending-count-landing-requests.service';
import { PendingCountLandingRequestsController } from './pending-count-landing-requests.controller';

describe('PendingCountLandingRequestsController', () => {
  let controller: PendingCountLandingRequestsController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'a',
    email: 'a@x',
    role: UserRole.COORDINATOR,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new PendingCountLandingRequestsController({
      execute,
    } as unknown as PendingCountLandingRequestsService);
  });

  it('delega o ator e retorna a contagem', async () => {
    execute.mockResolvedValue({ count: 3 });
    await expect(controller.handle(actor)).resolves.toEqual({ count: 3 });
    expect(execute).toHaveBeenCalledWith(actor);
  });
});
