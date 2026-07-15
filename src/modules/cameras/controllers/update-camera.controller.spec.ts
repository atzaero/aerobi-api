import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { CameraResponseDTO } from '../dtos/camera-response.dto';
import type { UpdateCameraDTO } from '../dtos/update-camera.dto';
import type { UpdateCameraService } from '../services/update-camera.service';

import { UpdateCameraController } from './update-camera.controller';

describe('UpdateCameraController', () => {
  let controller: UpdateCameraController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'u1',
    email: 'u@u.com',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateCameraController({
      execute,
    } as unknown as UpdateCameraService);
  });

  it('delega id (do param), dto e ator', async () => {
    const dto = {} as UpdateCameraDTO;
    const row = new CameraResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle({ id: 'c1' }, dto, actor)).resolves.toBe(
      row,
    );
    expect(execute).toHaveBeenCalledWith('c1', dto, actor);
  });
});
