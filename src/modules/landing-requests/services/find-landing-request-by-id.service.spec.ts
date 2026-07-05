import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { LandingRequestAircraft } from '@/generated/prisma/client';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { LandingRequestRepository } from '../repositories/landing-request.repository';
import { buildLandingRequestFixture } from '../testing/landing-request.entity.fixture';
import { FindLandingRequestByIdService } from './find-landing-request-by-id.service';

describe('FindLandingRequestByIdService', () => {
  let service: FindLandingRequestByIdService;
  let findById: jest.Mock;
  let findManyByIds: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    findManyByIds = jest.fn().mockResolvedValue([]);
    service = new FindLandingRequestByIdService(
      { findById } as unknown as LandingRequestRepository,
      { findManyByIds } as unknown as UserRepository,
      new ErrorMessageService(),
    );
  });

  it('inclui rabAircraft e mascara o CPF', async () => {
    findById.mockResolvedValue({
      ...buildLandingRequestFixture({ pilotCpf: '12345678909' }),
      aircraft: {
        period: '2026-07',
        marcas: 'PTABC',
      } as LandingRequestAircraft,
    });
    const out = await service.execute('lr-1');
    expect(out.pilotCpf).toBe('123.456.***-**');
    expect(out.rabAircraft?.marcas).toBe('PTABC');
  });

  it('inexistente → 404', async () => {
    findById.mockResolvedValue(null);
    await expect(service.execute('lr-1')).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });
});
