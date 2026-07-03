import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { CamerasPaginatedResponseDTO } from '../dtos/cameras-paginated-response.dto';
import type { ListCamerasService } from '../services/list-cameras.service';

import { ListCamerasController } from './list-cameras.controller';

describe('ListCamerasController', () => {
  let controller: ListCamerasController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'u1',
    email: 'u@u.com',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListCamerasController({
      execute,
    } as unknown as ListCamerasService);
  });

  it('delega query + ator', async () => {
    const q = { limit: 5 };
    const page = new CamerasPaginatedResponseDTO([], 1, 5, 0);
    execute.mockResolvedValue(page);
    await expect(controller.handle(q, actor)).resolves.toBe(page);
    expect(execute).toHaveBeenCalledWith(q, actor);
  });
});
