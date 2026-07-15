import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromesPaginatedResponseDTO } from '../dtos/aerodromes-paginated-response.dto';
import type { ListAerodromesService } from '../services/list-aerodromes.service';

import { ListAerodromesController } from './list-aerodromes.controller';

describe('ListAerodromesController', () => {
  let controller: ListAerodromesController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'u1',
    email: 'u@x',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListAerodromesController({
      execute,
    } as unknown as ListAerodromesService);
  });

  it('delega query + ator', async () => {
    const q = { search: 'sb' };
    const p = new AerodromesPaginatedResponseDTO([], 1, 10, 0);
    execute.mockResolvedValue(p);
    await expect(controller.handle(q, actor)).resolves.toBe(p);
    expect(execute).toHaveBeenCalledWith(q, actor);
  });
});
