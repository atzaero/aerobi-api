import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { CameraResponseDTO } from '../dtos/camera-response.dto';
import type { RemoveCameraService } from '../services/remove-camera.service';

import { RemoveCameraController } from './remove-camera.controller';

describe('RemoveCameraController', () => {
  let controller: RemoveCameraController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'u9',
    email: 'u@u.com',
    role: UserRole.COORDINATOR,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveCameraController({
      execute,
    } as unknown as RemoveCameraService);
  });

  it('delega id + deletedBy = ator.id', async () => {
    const row = new CameraResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle({ id: 'c1' }, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({ id: 'c1', deletedBy: 'u9' });
  });
});
