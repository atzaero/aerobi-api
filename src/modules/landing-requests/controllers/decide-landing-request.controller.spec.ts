import { buildMockRequest } from '@/common/testing/http-request.mock';
import { LandingRequestStatus, UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { DecideLandingRequestDTO } from '../dtos/decide-landing-request.dto';
import type { LandingRequestParamDTO } from '../dtos/landing-request-param.dto';
import type { DecideLandingRequestService } from '../services/decide-landing-request.service';
import { DecideLandingRequestController } from './decide-landing-request.controller';

describe('DecideLandingRequestController', () => {
  let controller: DecideLandingRequestController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'coord-1',
    email: 'c@c.com',
    role: UserRole.COORDINATOR,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new DecideLandingRequestController({
      execute,
    } as unknown as DecideLandingRequestService);
  });

  it('delega id/dto/ator e monta o contexto de auditoria do ator', async () => {
    const params: LandingRequestParamDTO = {
      id: '55555555-5555-4555-8555-555555555555',
    };
    const dto: DecideLandingRequestDTO = {
      decision: LandingRequestStatus.APPROVED,
    };
    const request = buildMockRequest({ ip: '9.9.9.9' });
    const row = { id: params.id };
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, dto, actor, request)).resolves.toBe(
      row,
    );
    expect(execute).toHaveBeenCalledWith(
      params.id,
      dto,
      actor,
      expect.objectContaining({ actorId: actor.id }),
    );
  });
});
