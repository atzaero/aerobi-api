import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';
import { buildAerodromeFeedbackFixture } from '../testing/aerodrome-feedback.entity.fixture';

import { RemoveAerodromeFeedbackService } from './remove-aerodrome-feedback.service';

describe('RemoveAerodromeFeedbackService', () => {
  let service: RemoveAerodromeFeedbackService;
  let findById: jest.Mock;
  let softDelete: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    softDelete = jest.fn();
    const repo = {
      findById,
      softDelete,
    } as unknown as AerodromeFeedbackRepository;
    service = new RemoveAerodromeFeedbackService(
      repo,
      new ErrorMessageService(),
    );
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
    findById.mockResolvedValue(buildAerodromeFeedbackFixture({ id }));
    const del = buildAerodromeFeedbackFixture({
      id,
      deletedAt: new Date('2026-01-01T00:00:00.000Z'),
      deletedBy: 'z',
    });
    softDelete.mockResolvedValue(del);
    await service.execute({ id, deletedBy: 'z' });
    expect(softDelete).toHaveBeenCalledWith(id, 'z');
  });
});
