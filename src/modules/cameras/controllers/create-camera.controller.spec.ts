import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { CameraResponseDTO } from '../dtos/camera-response.dto';
import type { CreateCameraDTO } from '../dtos/create-camera.dto';
import type { CreateCameraService } from '../services/create-camera.service';

import { CreateCameraController } from './create-camera.controller';

describe('CreateCameraController', () => {
  let controller: CreateCameraController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'u1',
    email: 'u@u.com',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateCameraController({
      execute,
    } as unknown as CreateCameraService);
  });

  it('delega dto + ator', async () => {
    const dto = {} as CreateCameraDTO;
    const row = new CameraResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(dto, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(dto, actor);
  });
});
