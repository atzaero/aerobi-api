import { LandingRequestStatus } from '@/generated/prisma/client';

import type { CreateLandingRequestDTO } from '../dtos/create-landing-request.dto';
import { buildLandingRequestCreateInput } from '../mappers/landing-request.prisma.mapper';
import type { LandingRequestRepository } from '../repositories/landing-request.repository';
import { buildLandingRequestFixture } from '../testing/landing-request.entity.fixture';

import { CreateLandingRequestService } from './create-landing-request.service';

describe('CreateLandingRequestService', () => {
  let service: CreateLandingRequestService;
  let create: jest.Mock;

  beforeEach(() => {
    create = jest.fn();
    const repo = { create } as unknown as LandingRequestRepository;
    service = new CreateLandingRequestService(repo);
  });

  const buildDto = (): CreateLandingRequestDTO => ({
    aerodromeId: '22222222-2222-4222-8222-222222222222',
    status: LandingRequestStatus.PENDING,
    requestDate: new Date('2024-06-02T15:00:00.000Z'),
    email: 'x@y.com',
    createdBy: 'u1',
  });

  it('persistência via buildLandingRequestCreateInput', async () => {
    const dto = buildDto();
    const saved = buildLandingRequestFixture();
    create.mockResolvedValue(saved);

    const out = await service.execute(dto);

    expect(create).toHaveBeenCalledWith(buildLandingRequestCreateInput(dto));
    expect(out.id).toBe(saved.id);
    expect(out.status).toBe(saved.status);
  });
});
