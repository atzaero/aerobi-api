import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeParamDTO } from '../dtos/aerodrome-param.dto';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { UpdateAerodromeObservationDTO } from '../dtos/update-aerodrome-observation.dto';
import type { UpdateAerodromeObservationService } from '../services/update-aerodrome-observation.service';

import { UpdateAerodromeObservationController } from './update-aerodrome-observation.controller';

describe('UpdateAerodromeObservationController', () => {
  let controller: UpdateAerodromeObservationController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'op1',
    email: 'o@x',
    role: UserRole.OPERATOR,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateAerodromeObservationController({
      execute,
    } as unknown as UpdateAerodromeObservationService);
  });

  it('delega id, body e ator', async () => {
    const params: AerodromeParamDTO = {
      id: '77777777-7777-4777-8777-777777777777',
    };
    const body: UpdateAerodromeObservationDTO = { observation: 'Atenção' };
    const row = new AerodromeResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, body, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(params.id, body, actor);
  });
});
