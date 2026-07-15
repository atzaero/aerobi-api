import { buildMockRequest } from '@/common/testing/http-request.mock';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { LandingRequestParamDTO } from '../dtos/landing-request-param.dto';
import type { RemoveLandingRequestService } from '../services/remove-landing-request.service';
import { RemoveLandingRequestController } from './remove-landing-request.controller';

describe('RemoveLandingRequestController', () => {
  let controller: RemoveLandingRequestController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'admin-1',
    email: 'a@a.com',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveLandingRequestController({
      execute,
    } as unknown as RemoveLandingRequestService);
  });

  it('delega id/ator e monta o contexto de auditoria do ator', async () => {
    const params: LandingRequestParamDTO = {
      id: '55555555-5555-4555-8555-555555555555',
    };
    const request = buildMockRequest({ userAgent: 'jest' });
    const row = { id: params.id };
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, actor, request)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(
      params.id,
      actor,
      expect.objectContaining({ actorId: actor.id }),
    );
  });
});
