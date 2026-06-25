import { Uf, UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { CreateAerodromeGroupDTO } from '../dtos/create-aerodrome-group.dto';
import type { CreateAerodromeGroupService } from '../services/create-aerodrome-group.service';

import { CreateAerodromeGroupController } from './create-aerodrome-group.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

describe('CreateAerodromeGroupController', () => {
  let controller: CreateAerodromeGroupController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateAerodromeGroupController({
      execute,
    } as unknown as CreateAerodromeGroupService);
  });

  it('delega passando o ator autenticado', async () => {
    const dto: CreateAerodromeGroupDTO = {
      uf: Uf.SP,
      groupName: 'G',
    };
    const row = new AerodromeGroupResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(dto, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(dto, actor);
  });
});
