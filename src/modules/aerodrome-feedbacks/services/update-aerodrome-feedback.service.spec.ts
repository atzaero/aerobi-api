import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { patchAerodromeFeedbackToPrisma } from '../mappers/aerodrome-feedback.prisma.mapper';
import type { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';
import { buildAerodromeFeedbackFixture } from '../testing/aerodrome-feedback.entity.fixture';

import { UpdateAerodromeFeedbackService } from './update-aerodrome-feedback.service';

describe('UpdateAerodromeFeedbackService', () => {
  let service: UpdateAerodromeFeedbackService;
  let findById: jest.Mock;
  let update: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    update = jest.fn();
    const repo = { findById, update } as unknown as AerodromeFeedbackRepository;
    service = new UpdateAerodromeFeedbackService(
      repo,
      new ErrorMessageService(),
    );
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('404', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute({ id, comment: 'x' });
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(update).not.toHaveBeenCalled();
  });

  it('patch com connect aeródromo', async () => {
    const newAid = '33333333-3333-4333-8333-333333333333';
    findById.mockResolvedValue(buildAerodromeFeedbackFixture({ id }));
    update.mockResolvedValue(
      buildAerodromeFeedbackFixture({
        id,
        operationalAerodromeId: newAid,
      }),
    );
    await service.execute({ id, operationalAerodromeId: newAid });
    expect(update).toHaveBeenCalledWith(
      id,
      patchAerodromeFeedbackToPrisma({ operationalAerodromeId: newAid }),
    );
  });
});
