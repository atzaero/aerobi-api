import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { AerodromeRepository } from '../repositories/aerodrome.repository';
import { buildAerodromeFixture } from '../testing/aerodrome.entity.fixture';

import { FindAerodromeByIdService } from './find-aerodrome-by-id.service';

describe('FindAerodromeByIdService', () => {
  let service: FindAerodromeByIdService;
  let findById: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    const repo = { findById } as unknown as AerodromeRepository;
    service = new FindAerodromeByIdService(repo, new ErrorMessageService());
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('sucesso', async () => {
    findById.mockResolvedValue(buildAerodromeFixture({ id }));
    await expect(service.execute({ id })).resolves.toMatchObject({ id });
  });

  it('404', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute({ id });
      throw new Error('expected');
    } catch (e) {
      expect(e).toBeInstanceOf(CustomHttpException);
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
  });
});
