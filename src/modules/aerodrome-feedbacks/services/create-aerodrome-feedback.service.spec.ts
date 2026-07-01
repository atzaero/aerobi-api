import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { FeedbackRating, type Prisma } from '@/generated/prisma/client';

import type { CreateAerodromeFeedbackDTO } from '../dtos/create-aerodrome-feedback.dto';
import type { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';
import { buildAerodromeFeedbackFixture } from '../testing/aerodrome-feedback.entity.fixture';

import { CreateAerodromeFeedbackService } from './create-aerodrome-feedback.service';

describe('CreateAerodromeFeedbackService', () => {
  let service: CreateAerodromeFeedbackService;
  let create: jest.Mock;
  let findActiveAerodrome: jest.Mock;

  const aerodromeId = '22222222-2222-4222-8222-222222222222';

  const dto = (
    overrides: Partial<CreateAerodromeFeedbackDTO> = {},
  ): CreateAerodromeFeedbackDTO => ({
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
    } as unknown as AerodromeFeedbackRepository;
    service = new CreateAerodromeFeedbackService(
      repo,
      new ErrorMessageService(),
    );
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
      buildAerodromeFeedbackFixture({ rating: FeedbackRating.NEGATIVE }),
    );

    await service.execute(dto());

    const [[input]] = create.mock.calls as Array<
      [Prisma.AerodromeFeedbackCreateInput]
    >;
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
