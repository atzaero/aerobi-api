import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { FeedbackRepository } from '../repositories/feedback.repository';
import { buildFeedbackFixture } from '../testing/feedback.entity.fixture';

import { FindFeedbackByIdService } from './find-feedback-by-id.service';

describe('FindFeedbackByIdService', () => {
  let service: FindFeedbackByIdService;
  let findById: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    const repo = { findById } as unknown as FeedbackRepository;
    service = new FindFeedbackByIdService(repo, new ErrorMessageService());
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('sucesso', async () => {
    findById.mockResolvedValue(buildFeedbackFixture({ id }));
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
