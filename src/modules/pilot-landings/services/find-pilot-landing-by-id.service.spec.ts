import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { PilotLandingRepository } from '../repositories/pilot-landing.repository';
import { buildPilotLandingFixture } from '../testing/pilot-landing.entity.fixture';

import { FindPilotLandingByIdService } from './find-pilot-landing-by-id.service';

describe('FindPilotLandingByIdService', () => {
  let service: FindPilotLandingByIdService;
  let findById: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    const repo = { findById } as unknown as PilotLandingRepository;
    const errorMessageService = new ErrorMessageService();
    service = new FindPilotLandingByIdService(repo, errorMessageService);
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('devolve o registo quando existe', async () => {
    const entity = buildPilotLandingFixture({ id });
    findById.mockResolvedValue(entity);

    const out = await service.execute({ id });

    expect(findById).toHaveBeenCalledWith(id);
    expect(out.id).toBe(id);
    expect(out.registration).toBe(entity.registration);
  });

  it('lança RESOURCE_NOT_FOUND quando não existe', async () => {
    findById.mockResolvedValue(null);

    await expect(service.execute({ id })).rejects.toBeInstanceOf(
      CustomHttpException,
    );

    try {
      await service.execute({ id });
    } catch (err) {
      expect(err).toBeInstanceOf(CustomHttpException);
      expect((err as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
      expect((err as CustomHttpException).getStatus()).toBe(404);
    }
  });
});
