import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { UserResponseDto } from '../dtos/user-response.dto';
import type { ResendInviteService } from '../services/resend-invite.service';

import { ResendInviteController } from './resend-invite.controller';

describe('ResendInviteController', () => {
  let controller: ResendInviteController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ResendInviteController({
      execute,
    } as unknown as ResendInviteService);
  });

  it('monta input { userId, actorId } a partir de param + actor', async () => {
    const actor: AuthenticatedUser = {
      id: 'admin-1',
      email: 'a@x',
      role: UserRole.ADMIN,
    };
    const refreshed = { id: 'target', email: 'p@x' } as UserResponseDto;
    execute.mockResolvedValue(refreshed);

    await expect(controller.handle({ id: 'target' }, actor)).resolves.toBe(
      refreshed,
    );
    expect(execute).toHaveBeenCalledWith({
      userId: 'target',
      actorId: 'admin-1',
    });
  });
});
