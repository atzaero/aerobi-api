import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeGroupParamDTO } from '../dtos/aerodrome-group-param.dto';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { UpdateAerodromeGroupDTO } from '../dtos/update-aerodrome-group.dto';
import type { UpdateAerodromeGroupService } from '../services/update-aerodrome-group.service';

import { UpdateAerodromeGroupController } from './update-aerodrome-group.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

describe('UpdateAerodromeGroupController', () => {
  let controller: UpdateAerodromeGroupController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateAerodromeGroupController({
      execute,
    } as unknown as UpdateAerodromeGroupService);
  });

  it('delega id, body e ator ao service', async () => {
    const params: AerodromeGroupParamDTO = {
      id: '44444444-4444-4444-8444-444444444444',
    };
    const body: UpdateAerodromeGroupDTO = { name: 'X' };
    const row = new AerodromeGroupResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, body, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(params.id, body, actor);
  });
});
