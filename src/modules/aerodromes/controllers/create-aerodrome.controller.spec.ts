import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import type { CreateAerodromeDTO } from '../dtos/create-aerodrome.dto';
import type { CreateAerodromeService } from '../services/create-aerodrome.service';

import { CreateAerodromeController } from './create-aerodrome.controller';

describe('CreateAerodromeController', () => {
  let controller: CreateAerodromeController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'u1',
    email: 'u@x',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateAerodromeController({
      execute,
    } as unknown as CreateAerodromeService);
  });

  it('delega dto + ator ao service', async () => {
    const dto: CreateAerodromeDTO = {
      groupId: '44444444-4444-4444-8444-444444444444',
      icao: 'SBSP',
      name: 'Congonhas',
      latitude: '03°27\'18.50"S',
      longitude: '041°36\'16.91"W',
      altitude: '100',
    };
    const row = new AerodromeResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(dto, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(dto, actor);
  });
});
