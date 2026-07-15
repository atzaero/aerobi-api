import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { FeedbackRepository } from '../repositories/feedback.repository';
import { buildFeedbackFixture } from '../testing/feedback.entity.fixture';

import { RemoveFeedbackService } from './remove-feedback.service';

describe('RemoveFeedbackService', () => {
  let service: RemoveFeedbackService;
  let findById: jest.Mock;
  let softDelete: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    softDelete = jest.fn();
    const repo = {
      findById,
      softDelete,
    } as unknown as FeedbackRepository;
    service = new RemoveFeedbackService(repo, new ErrorMessageService());
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('404', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute({ id, deletedBy: 'a' });
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
  });

  it('soft delete', async () => {
    findById.mockResolvedValue(buildFeedbackFixture({ id }));
    const del = buildFeedbackFixture({
      id,
      deletedAt: new Date('2026-01-01T00:00:00.000Z'),
      deletedBy: 'z',
    });
    softDelete.mockResolvedValue(del);
    await service.execute({ id, deletedBy: 'z' });
    expect(softDelete).toHaveBeenCalledWith(id, 'z');
  });
});
