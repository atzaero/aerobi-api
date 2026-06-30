import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { patchPilotLandingToPrisma } from '../mappers/pilot-landing.prisma.mapper';
import type { PilotLandingRepository } from '../repositories/pilot-landing.repository';
import { buildPilotLandingFixture } from '../testing/pilot-landing.entity.fixture';

import { UpdatePilotLandingService } from './update-pilot-landing.service';

describe('UpdatePilotLandingService', () => {
  let service: UpdatePilotLandingService;
  let findById: jest.Mock;
  let update: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    update = jest.fn();
    const repo = { findById, update } as unknown as PilotLandingRepository;
    service = new UpdatePilotLandingService(repo, new ErrorMessageService());
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('404 quando o registo não existe', async () => {
    findById.mockResolvedValue(null);

    try {
      await service.execute({ id, registration: 'X' });
      throw new Error('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(CustomHttpException);
      expect((err as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(update).not.toHaveBeenCalled();
  });

  it('actualiza com patch do DTO', async () => {
    const existing = buildPilotLandingFixture({ id });
    const updated = buildPilotLandingFixture({ id, registration: 'PT-ZZZ' });
    findById.mockResolvedValue(existing);
    update.mockResolvedValue(updated);

    const out = await service.execute({
      id,
      registration: 'PT-ZZZ',
      localName: 'Y',
    });

    expect(update).toHaveBeenCalledWith(
      id,
      patchPilotLandingToPrisma({ registration: 'PT-ZZZ', localName: 'Y' }),
    );
    expect(out.registration).toBe('PT-ZZZ');
  });

  it('disconnectAerodrome desassocia o aeródromo no Prisma', async () => {
    const existing = buildPilotLandingFixture({ id });
    const updated = buildPilotLandingFixture({
      id,
      aerodromeId: null,
    });
    findById.mockResolvedValue(existing);
    update.mockResolvedValue(updated);

    await service.execute({
      id,
      disconnectAerodrome: true,
    });

    expect(update).toHaveBeenCalledWith(
      id,
      expect.objectContaining({
        aerodrome: { disconnect: true },
      }),
    );
  });
});
