import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { LandingRequestRepository } from '../repositories/landing-request.repository';
import { buildLandingRequestFixture } from '../testing/landing-request.entity.fixture';

import { FindLandingRequestByIdService } from './find-landing-request-by-id.service';

describe('FindLandingRequestByIdService', () => {
  let service: FindLandingRequestByIdService;
  let findById: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    const repo = { findById } as unknown as LandingRequestRepository;
    service = new FindLandingRequestByIdService(
      repo,
      new ErrorMessageService(),
    );
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('sucesso quando existe', async () => {
    const entity = buildLandingRequestFixture({ id });
    findById.mockResolvedValue(entity);
    const out = await service.execute({ id });
    expect(out.id).toBe(id);
  });

  it('404 quando não existe', async () => {
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
