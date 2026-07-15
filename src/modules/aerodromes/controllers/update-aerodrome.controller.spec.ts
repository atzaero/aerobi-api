import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeParamDTO } from '../dtos/aerodrome-param.dto';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { UpdateAerodromeDTO } from '../dtos/update-aerodrome.dto';
import type { UpdateAerodromeService } from '../services/update-aerodrome.service';

import { UpdateAerodromeController } from './update-aerodrome.controller';

describe('UpdateAerodromeController', () => {
  let controller: UpdateAerodromeController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'u1',
    email: 'u@x',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateAerodromeController({
      execute,
    } as unknown as UpdateAerodromeService);
  });

  it('delega id, body e ator', async () => {
    const params: AerodromeParamDTO = {
      id: '77777777-7777-4777-8777-777777777777',
    };
    const body: UpdateAerodromeDTO = {
      groupId: '44444444-4444-4444-8444-444444444444',
      icao: 'SDXX',
      name: 'Nome',
      latitude: '03°27\'18.50"S',
      longitude: '041°36\'16.91"W',
      altitude: '100',
    };
    const row = new AerodromeResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, body, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(params.id, body, actor);
  });
});
