import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';
import { buildOperationalAerodromeFixture } from '../testing/operational-aerodrome.entity.fixture';

import { FindOperationalAerodromeByIdService } from './find-operational-aerodrome-by-id.service';

describe('FindOperationalAerodromeByIdService', () => {
  let service: FindOperationalAerodromeByIdService;
  let findById: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    const repo = { findById } as unknown as OperationalAerodromeRepository;
    service = new FindOperationalAerodromeByIdService(
      repo,
      new ErrorMessageService(),
    );
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('sucesso', async () => {
    findById.mockResolvedValue(buildOperationalAerodromeFixture({ id }));
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
