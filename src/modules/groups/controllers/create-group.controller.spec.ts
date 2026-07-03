import type { Request } from 'express';

import { Uf, UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { GroupResponseDTO } from '../dtos/group-response.dto';
import { CreateGroupDTO } from '../dtos/create-group.dto';
import type { CreateGroupService } from '../services/create-group.service';

import { CreateGroupController } from './create-group.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

const request = {
  headers: { 'user-agent': 'jest-ua' },
  ip: '9.9.9.9',
} as unknown as Request;

describe('CreateGroupController', () => {
  let controller: CreateGroupController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateGroupController({
      execute,
    } as unknown as CreateGroupService);
  });

  it('delega passando ator e contexto de auditoria', async () => {
    const dto: CreateGroupDTO = {
      uf: Uf.SP,
      name: 'G',
    };
    const row = new GroupResponseDTO();
    execute.mockResolvedValue(row);

    await expect(controller.handle(dto, actor, request)).resolves.toBe(row);

    expect(execute).toHaveBeenCalledWith(
      dto,
      actor,
      expect.objectContaining({
        actorId: actor.id,
        actorEmail: actor.email,
        actorRole: actor.role,
        ipAddress: '9.9.9.9',
        userAgent: 'jest-ua',
      }),
    );
  });
});
