import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { LandingRequestStatus } from '@/generated/prisma/client';

import { patchLandingRequestToPrisma } from '../mappers/landing-request.prisma.mapper';
import type { LandingRequestRepository } from '../repositories/landing-request.repository';
import { buildLandingRequestFixture } from '../testing/landing-request.entity.fixture';

import { UpdateLandingRequestService } from './update-landing-request.service';

describe('UpdateLandingRequestService', () => {
  let service: UpdateLandingRequestService;
  let findById: jest.Mock;
  let update: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    update = jest.fn();
    const repo = { findById, update } as unknown as LandingRequestRepository;
    service = new UpdateLandingRequestService(repo, new ErrorMessageService());
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('404 quando não existe', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute({
        id,
        status: LandingRequestStatus.APPROVED,
      });
      throw new Error('expected');
    } catch (e) {
      expect(e).toBeInstanceOf(CustomHttpException);
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(update).not.toHaveBeenCalled();
  });

  it('actualiza com patch', async () => {
    const existing = buildLandingRequestFixture({ id });
    findById.mockResolvedValue(existing);
    const patched = buildLandingRequestFixture({
      id,
      status: LandingRequestStatus.APPROVED,
    });
    update.mockResolvedValue(patched);

    const dto = {
      status: LandingRequestStatus.APPROVED as const,
      email: 'n@ew.com',
    };
    await service.execute({ id, ...dto });

    expect(update).toHaveBeenCalledWith(id, patchLandingRequestToPrisma(dto));
  });

  it('mudança de aeródromo via connect', async () => {
    const newAid = '33333333-3333-4333-8333-333333333333';
    const existing = buildLandingRequestFixture({ id });
    findById.mockResolvedValue(existing);
    update.mockResolvedValue(
      buildLandingRequestFixture({ id, aerodromeId: newAid }),
    );

    await service.execute({
      id,
      aerodromeId: newAid,
    });

    expect(update).toHaveBeenCalledWith(
      id,
      expect.objectContaining({
        aerodrome: { connect: { id: newAid } },
      }),
    );
  });
});
