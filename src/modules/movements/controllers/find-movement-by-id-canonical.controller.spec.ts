import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { MovementResponseDTO } from '../dtos/movement-response.dto';
import type { FindMovementByIdService } from '../services/find-movement-by-id.service';

import { FindMovementByIdCanonicalController } from './find-movement-by-id-canonical.controller';

const actor: AuthenticatedUser = {
  id: 'u-1',
  email: 'a@e',
  role: UserRole.ADMIN,
};

describe('FindMovementByIdCanonicalController', () => {
  it('delega ao FindMovementByIdService com o movementId e o ator', async () => {
    const expected = { id: 'm-1' } as MovementResponseDTO;
    const execute = jest.fn().mockResolvedValue(expected);
    const service = { execute } as unknown as FindMovementByIdService;
    const controller = new FindMovementByIdCanonicalController(service);

    const res = await controller.handle({ movementId: 'm-1' }, actor);

    expect(execute).toHaveBeenCalledWith('m-1', actor);
    expect(res).toBe(expected);
  });
});
