import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { UpdateProfileRequestDto } from '../dtos/update-profile-request.dto';
import type { UserResponseDto } from '../dtos/user-response.dto';
import type { UpdateProfileService } from '../services/update-profile.service';

import { UpdateProfileController } from './update-profile.controller';

describe('UpdateProfileController', () => {
  let controller: UpdateProfileController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateProfileController({
      execute,
    } as unknown as UpdateProfileService);
  });

  it('repassa actor e body para o service', async () => {
    const dto: UpdateProfileRequestDto = { name: 'Novo Nome' };
    const actor: AuthenticatedUser = {
      id: 'user-id',
      email: 'u@x',
      role: UserRole.TECHNICAL,
    };
    const updated = { id: 'user-id', name: 'Novo Nome' } as UserResponseDto;
    execute.mockResolvedValue(updated);

    await expect(controller.handle(dto, actor)).resolves.toBe(updated);
    expect(execute).toHaveBeenCalledWith(actor, dto);
  });
});
