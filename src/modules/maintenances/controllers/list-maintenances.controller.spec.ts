import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ListMaintenancesQueryDTO } from '../dtos/list-maintenances-query.dto';
import { MaintenancesPaginatedResponseDTO } from '../dtos/maintenances-paginated-response.dto';
import type { ListMaintenancesService } from '../services/list-maintenances.service';

import { ListMaintenancesController } from './list-maintenances.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

describe('ListMaintenancesController', () => {
  let controller: ListMaintenancesController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListMaintenancesController({
      execute,
    } as unknown as ListMaintenancesService);
  });

  it('delega lista ao service.execute com query e ator', async () => {
    const query = {} as ListMaintenancesQueryDTO;
    const page = new MaintenancesPaginatedResponseDTO([], 1, 10, 0);
    execute.mockResolvedValue(page);

    await expect(controller.handle(query, actor)).resolves.toBe(page);

    expect(execute).toHaveBeenCalledWith(query, actor);
  });
});
