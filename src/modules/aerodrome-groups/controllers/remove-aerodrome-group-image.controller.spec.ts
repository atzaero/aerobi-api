import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeGroupParamDTO } from '../dtos/aerodrome-group-param.dto';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import type { RemoveAerodromeGroupImageService } from '../services/remove-aerodrome-group-image.service';

import { RemoveAerodromeGroupImageController } from './remove-aerodrome-group-image.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

describe('RemoveAerodromeGroupImageController', () => {
  let controller: RemoveAerodromeGroupImageController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveAerodromeGroupImageController({
      execute,
    } as unknown as RemoveAerodromeGroupImageService);
  });

  it('delega id e ator ao service', async () => {
    const params: AerodromeGroupParamDTO = {
      id: '44444444-4444-4444-8444-444444444444',
    };
    const row = new AerodromeGroupResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(params.id, actor);
  });
});
