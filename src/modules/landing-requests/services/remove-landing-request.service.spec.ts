import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { LandingRequestRepository } from '../repositories/landing-request.repository';
import { buildLandingRequestFixture } from '../testing/landing-request.entity.fixture';

import { RemoveLandingRequestService } from './remove-landing-request.service';

describe('RemoveLandingRequestService', () => {
  let service: RemoveLandingRequestService;
  let findById: jest.Mock;
  let softDelete: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    softDelete = jest.fn();
    const repo = {
      findById,
      softDelete,
    } as unknown as LandingRequestRepository;
    service = new RemoveLandingRequestService(repo, new ErrorMessageService());
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('404 quando não existe', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute({ id, deletedBy: 'a' });
      throw new Error('expected');
    } catch (e) {
      expect(e).toBeInstanceOf(CustomHttpException);
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
  });

  it('soft delete', async () => {
    const existing = buildLandingRequestFixture({ id });
    const del = buildLandingRequestFixture({
      id,
      deletedAt: new Date('2024-08-01T00:00:00.000Z'),
      deletedBy: 'actor',
    });
    findById.mockResolvedValue(existing);
    softDelete.mockResolvedValue(del);

    const out = await service.execute({ id, deletedBy: 'actor' });
    expect(softDelete).toHaveBeenCalledWith(id, 'actor');
    expect(out.deletedBy).toBe('actor');
  });
});
