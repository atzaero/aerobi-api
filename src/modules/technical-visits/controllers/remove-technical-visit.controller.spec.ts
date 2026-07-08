import { UserRole } from '@/generated/prisma/client';

import { buildAuthenticatedUserFixture } from '@/modules/auth/testing/authenticated-user.fixtures';

import { TechnicalVisitParamDTO } from '../dtos/technical-visit-param.dto';
import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import type { RemoveTechnicalVisitService } from '../services/remove-technical-visit.service';

import { RemoveTechnicalVisitController } from './remove-technical-visit.controller';

const actor = buildAuthenticatedUserFixture({
  id: '33333333-3333-4333-8333-333333333333',
  email: 'actor@test.com',
  role: UserRole.ADMIN,
});

describe('RemoveTechnicalVisitController', () => {
  let controller: RemoveTechnicalVisitController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveTechnicalVisitController({
      execute,
    } as unknown as RemoveTechnicalVisitService);
  });

  it('delega com ator', async () => {
    const params: TechnicalVisitParamDTO = {
      technicalVisitId: '66666666-6666-4666-8666-666666666666',
    };
    const row = new TechnicalVisitResponseDTO();
    execute.mockResolvedValue(row);
    const request = { headers: {} } as never;
    await expect(controller.handle(params, actor, request)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(
      params.technicalVisitId,
      actor,
      expect.objectContaining({ actorId: actor.id }),
    );
  });
});
