import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { StorageService } from '@/modules/storage/services/storage.service';

import type { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { buildAerodromeGroupFixture } from '../testing/aerodrome-group.entity.fixture';

import { FindAerodromeGroupByIdService } from './find-aerodrome-group-by-id.service';

const storage = {
  getPresignedUrl: jest.fn(),
} as unknown as StorageService;

describe('FindAerodromeGroupByIdService', () => {
  let service: FindAerodromeGroupByIdService;
  let findById: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    const repo = { findById } as unknown as AerodromeGroupRepository;
    service = new FindAerodromeGroupByIdService(
      repo,
      storage,
      new ErrorMessageService(),
    );
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('sucesso quando existe', async () => {
    findById.mockResolvedValue(buildAerodromeGroupFixture({ id }));
    await expect(service.execute(id)).resolves.toMatchObject({ id });
  });

  it('404 quando falta registo', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute(id);
      throw new Error('expected');
    } catch (e) {
      expect(e).toBeInstanceOf(CustomHttpException);
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
  });
});
