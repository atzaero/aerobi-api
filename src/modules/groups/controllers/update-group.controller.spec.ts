import type { Request } from 'express';

import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { GroupParamDTO } from '../dtos/group-param.dto';
import { GroupResponseDTO } from '../dtos/group-response.dto';
import { UpdateGroupDTO } from '../dtos/update-group.dto';
import type { UpdateGroupService } from '../services/update-group.service';

import { UpdateGroupController } from './update-group.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

const request = {
  headers: { 'user-agent': 'jest-ua' },
  ip: '9.9.9.9',
} as unknown as Request;

describe('UpdateGroupController', () => {
  let controller: UpdateGroupController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateGroupController({
      execute,
    } as unknown as UpdateGroupService);
  });

  it('delega id, body, ator e contexto de auditoria ao service', async () => {
    const params: GroupParamDTO = {
      id: '44444444-4444-4444-8444-444444444444',
    };
    const body: UpdateGroupDTO = { name: 'X' };
    const row = new GroupResponseDTO();
    execute.mockResolvedValue(row);

    await expect(controller.handle(params, body, actor, request)).resolves.toBe(
      row,
    );

    expect(execute).toHaveBeenCalledWith(
      params.id,
      body,
      actor,
      expect.objectContaining({
        actorId: actor.id,
        ipAddress: '9.9.9.9',
        userAgent: 'jest-ua',
      }),
    );
  });
});
