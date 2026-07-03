import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { CameraRepository } from '../repositories/camera.repository';
import { buildCameraFixture } from '../testing/camera.entity.fixture';

import { UpdateCameraService } from './update-camera.service';

describe('UpdateCameraService', () => {
  let service: UpdateCameraService;
  let findById: jest.Mock;
  let update: jest.Mock;
  let findActiveStreamConflict: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'u1',
    email: 'u@u.com',
    role: UserRole.ADMIN,
  };

  const expectCode = async (p: Promise<unknown>, code: ErrorCode) => {
    try {
      await p;
      throw new Error('expected a CustomHttpException');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(code);
    }
  };

  beforeEach(() => {
    findById = jest.fn();
    update = jest.fn();
    findActiveStreamConflict = jest.fn().mockResolvedValue(null);
    const repo = {
      findById,
      update,
      findActiveStreamConflict,
    } as unknown as CameraRepository;
    service = new UpdateCameraService(repo, new ErrorMessageService());
  });

  it('404 quando a câmera não existe', async () => {
    findById.mockResolvedValue(null);
    await expectCode(
      service.execute('id-1', { name: 'x' }, actor),
      ErrorCode.RESOURCE_NOT_FOUND,
    );
    expect(update).not.toHaveBeenCalled();
  });

  it('só name muda: não revalida unicidade; atualiza com updatedBy=ator', async () => {
    findById.mockResolvedValue(buildCameraFixture());
    update.mockResolvedValue(buildCameraFixture({ name: 'Novo' }));
    await service.execute('id-1', { name: 'Novo' }, actor);
    expect(findActiveStreamConflict).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith('id-1', {
      name: 'Novo',
      mediamtxNode: undefined,
      mediamtxPath: undefined,
      enabled: undefined,
      updatedBy: 'u1',
    });
  });

  it('muda node: revalida unicidade (icao do registro + exceptId) → 409 se conflito', async () => {
    findById.mockResolvedValue(
      buildCameraFixture({ icao: 'SBXX', mediamtxPath: 'p0' }),
    );
    findActiveStreamConflict.mockResolvedValue({ id: 'other' });
    await expectCode(
      service.execute('id-1', { mediamtxNode: 'n2' }, actor),
      ErrorCode.CONFLICT,
    );
    expect(findActiveStreamConflict).toHaveBeenCalledWith({
      icao: 'SBXX',
      mediamtxNode: 'n2',
      mediamtxPath: 'p0',
      exceptId: 'id-1',
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('P2002 no update → 409', async () => {
    findById.mockResolvedValue(buildCameraFixture());
    update.mockRejectedValue({ code: 'P2002' });
    await expectCode(
      service.execute('id-1', { name: 'x' }, actor),
      ErrorCode.CONFLICT,
    );
  });
});
