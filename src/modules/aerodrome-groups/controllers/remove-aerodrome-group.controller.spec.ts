import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeGroupDeletionResponseDTO } from '../dtos/aerodrome-group-deletion-response.dto';
import { AerodromeGroupParamDTO } from '../dtos/aerodrome-group-param.dto';
import type { RemoveAerodromeGroupService } from '../services/remove-aerodrome-group.service';

import { RemoveAerodromeGroupController } from './remove-aerodrome-group.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

describe('RemoveAerodromeGroupController', () => {
  let controller: RemoveAerodromeGroupController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveAerodromeGroupController({
      execute,
    } as unknown as RemoveAerodromeGroupService);
  });

  it('delega id e ator (deletedBy real, sem "system")', async () => {
    const params: AerodromeGroupParamDTO = {
      id: '44444444-4444-4444-8444-444444444444',
    };
    const row = new AerodromeGroupDeletionResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(params.id, actor);
  });
});
