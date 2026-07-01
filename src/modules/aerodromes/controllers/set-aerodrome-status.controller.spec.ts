import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeParamDTO } from '../dtos/aerodrome-param.dto';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { SetAerodromeStatusDTO } from '../dtos/set-aerodrome-status.dto';
import type { SetAerodromeStatusService } from '../services/set-aerodrome-status.service';

import { SetAerodromeStatusController } from './set-aerodrome-status.controller';

describe('SetAerodromeStatusController', () => {
  let controller: SetAerodromeStatusController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'c1',
    email: 'c@x',
    role: UserRole.COORDINATOR,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new SetAerodromeStatusController({
      execute,
    } as unknown as SetAerodromeStatusService);
  });

  it('delega id, body e ator', async () => {
    const params: AerodromeParamDTO = {
      id: '77777777-7777-4777-8777-777777777777',
    };
    const body: SetAerodromeStatusDTO = { field: 'isOpen', value: false };
    const row = new AerodromeResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, body, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(params.id, body, actor);
  });
});
