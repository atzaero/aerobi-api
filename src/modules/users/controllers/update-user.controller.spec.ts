import type { Request } from 'express';

import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { AdminUpdateUserRequestDto } from '../dtos/admin-update-user-request.dto';
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
    const dto: AdminUpdateUserRequestDto = {
      name: 'Novo Nome',
      role: UserRole.OPERATOR,
    };
    const actor: AuthenticatedUser = {
      id: 'admin-id',
      email: 'a@x',
      role: UserRole.ADMIN,
    };
    const updated = { id: 'target-id', name: 'Novo Nome' } as UserResponseDto;
    execute.mockResolvedValue(updated);
    const request = {
      headers: { 'user-agent': 'jest-ua' },
      ip: '9.9.9.9',
    } as unknown as Request;

    await expect(
      controller.handle({ id: 'target-id' }, dto, actor, request),
    ).resolves.toBe(updated);
    expect(execute).toHaveBeenCalledWith(
      'target-id',
      dto,
      actor,
      expect.objectContaining({ actorId: actor.id, ipAddress: '9.9.9.9' }),
    );
  });
});
