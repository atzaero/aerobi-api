import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { UserResponseDto } from '../dtos/user-response.dto';
import type { FindUserByIdService } from '../services/find-user-by-id.service';

import { FindUserByIdController } from './find-user-by-id.controller';

describe('FindUserByIdController', () => {
  let controller: FindUserByIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindUserByIdController({
      execute,
    } as unknown as FindUserByIdService);
  });

  it('repassa id (extraído do param) + actor para o service', async () => {
    const actor: AuthenticatedUser = {
      id: 'self-id',
      email: 'u@x',
      role: UserRole.COORDINATOR,
    };
    const found = { id: 'self-id', email: 'u@x' } as UserResponseDto;
    execute.mockResolvedValue(found);

    await expect(controller.handle({ id: 'self-id' }, actor)).resolves.toBe(
      found,
    );
    expect(execute).toHaveBeenCalledWith('self-id', actor);
  });
});
