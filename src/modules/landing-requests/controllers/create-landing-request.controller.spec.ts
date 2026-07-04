import { buildMockRequest } from '@/common/testing/http-request.mock';

import type { CreateLandingRequestDTO } from '../dtos/create-landing-request.dto';
import type { CreateLandingRequestService } from '../services/create-landing-request.service';
import { CreateLandingRequestController } from './create-landing-request.controller';

describe('CreateLandingRequestController', () => {
  let controller: CreateLandingRequestController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn().mockResolvedValue({ id: 'lr-1', uf: 'SP' });
    controller = new CreateLandingRequestController({
      execute,
    } as unknown as CreateLandingRequestService);
  });

  it('delega o DTO e monta o contexto de auditoria com ator nulo (público)', async () => {
    const dto = { aerodromeId: 'aero-1' } as CreateLandingRequestDTO;
    const request = buildMockRequest({ ip: '1.2.3.4', userAgent: 'jest' });
    await controller.handle(dto, request);
    expect(execute).toHaveBeenCalledWith(
      dto,
      expect.objectContaining({ actorId: null, ipAddress: '1.2.3.4' }),
    );
  });
});
