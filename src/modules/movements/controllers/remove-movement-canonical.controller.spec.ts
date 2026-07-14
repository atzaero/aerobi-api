import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { MovementResponseDTO } from '../dtos/movement-response.dto';
import type { RemoveMovementService } from '../services/remove-movement.service';

import { RemoveMovementCanonicalController } from './remove-movement-canonical.controller';

const actor: AuthenticatedUser = {
  id: 'u-1',
  email: 'a@e',
  role: UserRole.ADMIN,
};

describe('RemoveMovementCanonicalController', () => {
  it('delega ao RemoveMovementService com id e ator', async () => {
    const expected = { id: 'm-1' } as MovementResponseDTO;
    const execute = jest.fn().mockResolvedValue(expected);
    const service = { execute } as unknown as RemoveMovementService;
    const controller = new RemoveMovementCanonicalController(service);

    const res = await controller.handle({ movementId: 'm-1' }, actor);

    expect(execute).toHaveBeenCalledWith({ id: 'm-1' }, actor);
    expect(res).toBe(expected);
  });
});
