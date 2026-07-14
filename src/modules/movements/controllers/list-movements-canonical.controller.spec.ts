import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { MovementsPaginatedResponseDTO } from '../dtos/movements-paginated-response.dto';
import type { ListMovementsService } from '../services/list-movements.service';

import { ListMovementsCanonicalController } from './list-movements-canonical.controller';

const actor: AuthenticatedUser = {
  id: 'u-1',
  email: 'a@e',
  role: UserRole.ADMIN,
};

describe('ListMovementsCanonicalController', () => {
  it('delega ao ListMovementsService com a query e o ator', async () => {
    const expected = {} as MovementsPaginatedResponseDTO;
    const execute = jest.fn().mockResolvedValue(expected);
    const service = { execute } as unknown as ListMovementsService;
    const controller = new ListMovementsCanonicalController(service);

    const query = { registration: 'PR-ZTT' };
    const res = await controller.handle(query, actor);

    expect(execute).toHaveBeenCalledWith(query, actor);
    expect(res).toBe(expected);
  });
});
