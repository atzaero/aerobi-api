import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { RemoveUserService } from '../services/remove-user.service';

import { RemoveUserController } from './remove-user.controller';

describe('RemoveUserController', () => {
  let controller: RemoveUserController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveUserController({
      execute,
    } as unknown as RemoveUserService);
  });

  it('repassa id (param) + actor.id para o service', async () => {
    const actor: AuthenticatedUser = {
      id: 'admin-1',
      email: 'a@x',
      role: UserRole.ADMIN,
    };
    execute.mockResolvedValue(undefined);

    await expect(
      controller.handle({ id: 'target-id' }, actor),
    ).resolves.toBeUndefined();
    expect(execute).toHaveBeenCalledWith('target-id', 'admin-1');
  });
});
