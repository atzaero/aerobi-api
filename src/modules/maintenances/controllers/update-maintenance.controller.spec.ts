import { buildMockRequest } from '@/common/testing/http-request.mock';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { UpdateMaintenanceResponseDTO } from '../dtos/maintenance-response.dto';
import { UpdateMaintenanceDTO } from '../dtos/update-maintenance.dto';
import type { UpdateMaintenanceService } from '../services/update-maintenance.service';

import { UpdateMaintenanceController } from './update-maintenance.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

const request = buildMockRequest();

describe('UpdateMaintenanceController', () => {
  let controller: UpdateMaintenanceController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateMaintenanceController({
      execute,
    } as unknown as UpdateMaintenanceService);
  });

  it('delega PATCH ao service.execute com id e body', async () => {
    const id = '00000000-0000-4000-8000-000000000001';
    const dto = {} as UpdateMaintenanceDTO;
    const row = new UpdateMaintenanceResponseDTO();
    execute.mockResolvedValue(row);

    await expect(controller.handle({ id }, dto, actor, request)).resolves.toBe(
      row,
    );

    expect(execute).toHaveBeenCalledWith(
      id,
      dto,
      actor,
      expect.objectContaining({ actorId: actor.id }),
    );
  });
});
