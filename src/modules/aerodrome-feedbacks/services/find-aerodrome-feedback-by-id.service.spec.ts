import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';
import { buildAerodromeFeedbackFixture } from '../testing/aerodrome-feedback.entity.fixture';

import { FindAerodromeFeedbackByIdService } from './find-aerodrome-feedback-by-id.service';

describe('FindAerodromeFeedbackByIdService', () => {
  let service: FindAerodromeFeedbackByIdService;
  let findById: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    const repo = { findById } as unknown as AerodromeFeedbackRepository;
    service = new FindAerodromeFeedbackByIdService(
      repo,
      new ErrorMessageService(),
    );
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('sucesso', async () => {
    findById.mockResolvedValue(buildAerodromeFeedbackFixture({ id }));
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
