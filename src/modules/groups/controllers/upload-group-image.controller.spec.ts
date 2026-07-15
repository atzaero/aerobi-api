import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { GroupParamDTO } from '../dtos/group-param.dto';
import { GroupResponseDTO } from '../dtos/group-response.dto';
import type { UploadGroupImageService } from '../services/upload-group-image.service';

import { UploadGroupImageController } from './upload-group-image.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

describe('UploadGroupImageController', () => {
  let controller: UploadGroupImageController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UploadGroupImageController({
      execute,
    } as unknown as UploadGroupImageService);
  });

  it('delega id, imagem e ator ao service', async () => {
    const params: GroupParamDTO = {
      id: '44444444-4444-4444-8444-444444444444',
    };
    const image = { mimetype: 'image/png' } as Express.Multer.File;
    const row = new GroupResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, image, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(params.id, image, actor);
  });
});
