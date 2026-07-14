import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { MovementResponseDTO } from '../dtos/movement-response.dto';
import type { UpdateMovementService } from '../services/update-movement.service';

import { UpdateMovementCanonicalController } from './update-movement-canonical.controller';

const actor: AuthenticatedUser = {
  id: 'u-1',
  email: 'a@e',
  role: UserRole.ADMIN,
};

describe('UpdateMovementCanonicalController', () => {
  it('delega ao UpdateMovementService com {id, registration} e o ator', async () => {
    const expected = { id: 'm-1' } as MovementResponseDTO;
    const execute = jest.fn().mockResolvedValue(expected);
    const service = { execute } as unknown as UpdateMovementService;
    const controller = new UpdateMovementCanonicalController(service);

    const res = await controller.handle(
      { movementId: 'm-1' },
      { registration: 'PR-ZTT' },
      actor,
    );

    expect(execute).toHaveBeenCalledWith(
      { id: 'm-1', registration: 'PR-ZTT' },
      actor,
    );
    expect(res).toBe(expected);
  });
});
