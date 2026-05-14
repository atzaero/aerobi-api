import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { UpdateUserRequestDto } from '../dtos/update-user-request.dto';
import type { UserResponseDto } from '../dtos/user-response.dto';
import type { UpdateUserService } from '../services/update-user.service';

import { UpdateUserController } from './update-user.controller';

describe('UpdateUserController', () => {
  let controller: UpdateUserController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateUserController({
      execute,
    } as unknown as UpdateUserService);
  });

  it('repassa id, body e actor para o service', async () => {
    const dto: UpdateUserRequestDto = { name: 'Novo Nome' };
    const actor: AuthenticatedUser = {
      id: 'self-id',
      email: 'u@x',
      role: UserRole.OPERATOR,
    };
    const updated = { id: 'self-id', name: 'Novo Nome' } as UserResponseDto;
    execute.mockResolvedValue(updated);

    await expect(
      controller.handle({ id: 'self-id' }, dto, actor),
    ).resolves.toBe(updated);
    expect(execute).toHaveBeenCalledWith('self-id', dto, actor);
  });
});
