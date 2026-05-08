import { LandingRequestStatus } from '@/generated/prisma/client';

import { CreateLandingRequestDTO } from '../dtos/create-landing-request.dto';
import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import type { CreateLandingRequestService } from '../services/create-landing-request.service';

import { CreateLandingRequestController } from './create-landing-request.controller';

describe('CreateLandingRequestController', () => {
  let controller: CreateLandingRequestController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateLandingRequestController({
      execute,
    } as unknown as CreateLandingRequestService);
  });

  it('delega ao service', async () => {
    const dto: CreateLandingRequestDTO = {
      operationalAerodromeId: '22222222-2222-4222-8222-222222222222',
      status: LandingRequestStatus.PENDING,
      requestDate: new Date(),
    };
    const row = new LandingRequestResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(dto)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(dto);
  });
});
