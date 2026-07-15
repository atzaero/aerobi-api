import { buildMockRequest } from '@/common/testing/http-request.mock';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { CreateMaintenanceDTO } from '../dtos/create-maintenance.dto';
import { CreateMaintenanceResponseDTO } from '../dtos/maintenance-response.dto';
import type { CreateMaintenanceService } from '../services/create-maintenance.service';

import { CreateMaintenanceController } from './create-maintenance.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

const request = buildMockRequest({ ip: '9.9.9.9', userAgent: 'jest-ua' });

describe('CreateMaintenanceController', () => {
  let controller: CreateMaintenanceController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateMaintenanceController({
      execute,
    } as unknown as CreateMaintenanceService);
  });

  it('delega ao service.execute com body, ator e audit', async () => {
    const dto = {} as CreateMaintenanceDTO;
    const row = new CreateMaintenanceResponseDTO();
    execute.mockResolvedValue(row);

    await expect(controller.handle(dto, actor, request)).resolves.toBe(row);

    expect(execute).toHaveBeenCalledWith(
      dto,
      actor,
      expect.objectContaining({ actorId: actor.id }),
    );
  });
});
