import { buildMockRequest } from '@/common/testing/http-request.mock';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { DocumentResponseDTO } from '../dtos/document-response.dto';
import { UploadAerodromeFileDTO } from '../dtos/upload-aerodrome-file.dto';
import type { UploadAerodromeFileService } from '../services/upload-aerodrome-file.service';

import { UploadAerodromeFileController } from './upload-aerodrome-file.controller';

describe('UploadAerodromeFileController', () => {
  let controller: UploadAerodromeFileController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'coord-1',
    email: 'c@c.com',
    role: UserRole.COORDINATOR,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new UploadAerodromeFileController({
      execute,
    } as unknown as UploadAerodromeFileService);
  });

  it('delega dto/file/ator + contexto de auditoria', async () => {
    const dto: UploadAerodromeFileDTO = {
      aerodromeId: '22222222-2222-4222-8222-222222222222',
      type: 'kml',
      mode: 'update',
    };
    const file = { originalname: 'mapa.kml' } as Express.Multer.File;
    const request = buildMockRequest({ userAgent: 'jest' });
    const row = new DocumentResponseDTO();
    execute.mockResolvedValue(row);

    await expect(controller.handle(dto, file, actor, request)).resolves.toBe(
      row,
    );
    expect(execute).toHaveBeenCalledWith(
      dto,
      file,
      actor,
      expect.objectContaining({ actorId: actor.id }),
    );
  });
});
