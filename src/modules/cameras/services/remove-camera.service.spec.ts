import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { CameraRepository } from '../repositories/camera.repository';
import { buildCameraFixture } from '../testing/camera.entity.fixture';

import type { CameraQueryService } from './camera-query.service';
import { RemoveCameraService } from './remove-camera.service';

describe('RemoveCameraService', () => {
  let service: RemoveCameraService;
  let findById: jest.Mock;
  let softDelete: jest.Mock;
  let invalidate: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    softDelete = jest.fn();
    invalidate = jest.fn();
    const repo = { findById, softDelete } as unknown as CameraRepository;
    const cameraQuery = { invalidate } as unknown as CameraQueryService;
    service = new RemoveCameraService(
      repo,
      new ErrorMessageService(),
      cameraQuery,
    );
  });

  it('404 quando não existe', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute({ id: 'id-1', deletedBy: 'u9' });
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(softDelete).not.toHaveBeenCalled();
  });

  it('soft-delete com o ator real (deletedBy) e devolve o recurso', async () => {
    findById.mockResolvedValue(buildCameraFixture());
    softDelete.mockResolvedValue(
      buildCameraFixture({
        enabled: false,
        deletedAt: new Date('2024-07-01T00:00:00.000Z'),
        deletedBy: 'u9',
      }),
    );
    const out = await service.execute({ id: 'id-1', deletedBy: 'u9' });
    expect(softDelete).toHaveBeenCalledWith('id-1', 'u9');
    expect(out.deletedBy).toBe('u9');
    expect(out.enabled).toBe(false);
    /** Tira a câmera do cache do proxy. */
    expect(invalidate).toHaveBeenCalledWith('id-1');
  });
});
