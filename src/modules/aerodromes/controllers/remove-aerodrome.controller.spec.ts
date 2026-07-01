import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeParamDTO } from '../dtos/aerodrome-param.dto';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import type { RemoveAerodromeService } from '../services/remove-aerodrome.service';

import { RemoveAerodromeController } from './remove-aerodrome.controller';

describe('RemoveAerodromeController', () => {
  let controller: RemoveAerodromeController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'admin-1',
    email: 'a@x',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveAerodromeController({
      execute,
    } as unknown as RemoveAerodromeService);
  });

  it('delega id + ator (ator real, não "system")', async () => {
    const params: AerodromeParamDTO = {
      id: '77777777-7777-4777-8777-777777777777',
    };
    const row = new AerodromeResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(params.id, actor);
  });
});
