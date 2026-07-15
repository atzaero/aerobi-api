import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { FeedbackRating, type Prisma } from '@/generated/prisma/client';

import type { CreateFeedbackDTO } from '../dtos/create-feedback.dto';
import type { FeedbackRepository } from '../repositories/feedback.repository';
import { buildFeedbackFixture } from '../testing/feedback.entity.fixture';

import { CreateFeedbackService } from './create-feedback.service';

describe('CreateFeedbackService', () => {
  let service: CreateFeedbackService;
  let create: jest.Mock;
  let findActiveAerodrome: jest.Mock;

  const aerodromeId = '22222222-2222-4222-8222-222222222222';

  const dto = (
    overrides: Partial<CreateFeedbackDTO> = {},
  ): CreateFeedbackDTO => ({
    aerodromeId,
    rating: FeedbackRating.NEGATIVE,
    sessionHash: 's',
    comment: 'ok',
    ...overrides,
  });

  beforeEach(() => {
    create = jest.fn();
    findActiveAerodrome = jest.fn();
    const repo = {
      create,
      findActiveAerodrome,
    } as unknown as FeedbackRepository;
    service = new CreateFeedbackService(repo, new ErrorMessageService());
  });

  it('404 quando o aeródromo não existe/está removido', async () => {
    findActiveAerodrome.mockResolvedValue(null);
    try {
      await service.execute(dto());
      throw new Error('expected');
    } catch (e) {
      expect(e).toBeInstanceOf(CustomHttpException);
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(create).not.toHaveBeenCalled();
  });

  it('deriva feedbackDate (dia UTC) e createdBy null; não os aceita do cliente', async () => {
    findActiveAerodrome.mockResolvedValue({ id: aerodromeId });
    create.mockResolvedValue(
      buildFeedbackFixture({ rating: FeedbackRating.NEGATIVE }),
    );

    await service.execute(dto());

    const [[input]] = create.mock.calls as Array<[Prisma.FeedbackCreateInput]>;
    expect(input.createdBy).toBeNull();
    expect(input.feedbackDate).toBeInstanceOf(Date);
    /** meia-noite UTC (rate-limit diário) */
    expect((input.feedbackDate as Date).toISOString()).toMatch(
      /T00:00:00\.000Z$/,
    );
  });

  it('rate-limit duplicado (P2002) → 409 FEEDBACK_DAILY_LIMIT_REACHED', async () => {
    findActiveAerodrome.mockResolvedValue({ id: aerodromeId });
    create.mockRejectedValue({ code: 'P2002' });
    try {
      await service.execute(dto());
      throw new Error('expected');
    } catch (e) {
      expect(e).toBeInstanceOf(CustomHttpException);
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.FEEDBACK_DAILY_LIMIT_REACHED,
      );
    }
  });

  it('erro não-P2002 é propagado intacto', async () => {
    findActiveAerodrome.mockResolvedValue({ id: aerodromeId });
    const boom = new Error('boom');
    create.mockRejectedValue(boom);
    await expect(service.execute(dto())).rejects.toBe(boom);
  });
});
