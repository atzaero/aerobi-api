import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeGroupParamDTO } from '../dtos/aerodrome-group-param.dto';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import type { UploadAerodromeGroupImageService } from '../services/upload-aerodrome-group-image.service';

import { UploadAerodromeGroupImageController } from './upload-aerodrome-group-image.controller';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

describe('UploadAerodromeGroupImageController', () => {
  let controller: UploadAerodromeGroupImageController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UploadAerodromeGroupImageController({
      execute,
    } as unknown as UploadAerodromeGroupImageService);
  });

  it('delega id, imagem e ator ao service', async () => {
    const params: AerodromeGroupParamDTO = {
      id: '44444444-4444-4444-8444-444444444444',
    };
    const image = { mimetype: 'image/png' } as Express.Multer.File;
    const row = new AerodromeGroupResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, image, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(params.id, image, actor);
  });
});
