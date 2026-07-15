import { buildMockRequest } from '@/common/testing/http-request.mock';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { MaintenanceDeletionResponseDTO } from '../dtos/maintenance-response.dto';
import type { RemoveMaintenanceService } from '../services/remove-maintenance.service';

import { RemoveMaintenanceController } from './remove-maintenance.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

const request = buildMockRequest();

describe('RemoveMaintenanceController', () => {
  let controller: RemoveMaintenanceController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveMaintenanceController({
      execute,
    } as unknown as RemoveMaintenanceService);
  });

  it('delega DELETE ao service com ator e audit', async () => {
    const id = '00000000-0000-4000-8000-000000000001';
    const row = new MaintenanceDeletionResponseDTO();
    execute.mockResolvedValue(row);

    await expect(controller.handle({ id }, actor, request)).resolves.toBe(row);

    expect(execute).toHaveBeenCalledWith(
      id,
      actor,
      expect.objectContaining({ actorId: actor.id }),
    );
  });
});
