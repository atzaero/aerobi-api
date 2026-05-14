import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { CreateUserRequestDto } from '../dtos/create-user-request.dto';
import type { UserResponseDto } from '../dtos/user-response.dto';
import type { CreateUserService } from '../services/create-user.service';

import { CreateUserController } from './create-user.controller';

describe('CreateUserController', () => {
  let controller: CreateUserController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateUserController({
      execute,
    } as unknown as CreateUserService);
  });

  it('delega o body + actorId do CurrentUser para o service', async () => {
    const dto: CreateUserRequestDto = {
      email: 'piloto@aerobi.local',
      name: 'Piloto',
      role: UserRole.OPERATOR,
    };
    const actor: AuthenticatedUser = {
      id: 'admin-1',
      email: 'admin@aerobi.local',
      role: UserRole.ADMIN,
    };
    const persisted = { id: 'new-id', email: dto.email } as UserResponseDto;
    execute.mockResolvedValue(persisted);

    await expect(controller.handle(dto, actor)).resolves.toBe(persisted);
    expect(execute).toHaveBeenCalledWith({
      ...dto,
      actorId: 'admin-1',
    });
  });
});
