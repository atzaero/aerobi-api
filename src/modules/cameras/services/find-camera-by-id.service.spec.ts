import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { CameraRepository } from '../repositories/camera.repository';
import { buildCameraFixture } from '../testing/camera.entity.fixture';

import { FindCameraByIdService } from './find-camera-by-id.service';

describe('FindCameraByIdService', () => {
  let service: FindCameraByIdService;
  let findById: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    const repo = { findById } as unknown as CameraRepository;
    service = new FindCameraByIdService(repo, new ErrorMessageService());
  });

  it('404 quando não existe', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute({ id: 'id-1' });
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
  });

  it('devolve a câmera mapeada', async () => {
    findById.mockResolvedValue(buildCameraFixture());
    const out = await service.execute({ id: 'id-1' });
    expect(out.id).toBe('11111111-1111-4111-8111-111111111111');
    expect(out.mediamtxNode).toBe('aerobi-edge-mvp');
  });
});
