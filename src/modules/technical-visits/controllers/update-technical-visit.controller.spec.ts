import { UserRole } from '@/generated/prisma/client';

import { buildAuthenticatedUserFixture } from '@/modules/auth/testing/authenticated-user.fixtures';

import { TechnicalVisitParamDTO } from '../dtos/technical-visit-param.dto';
import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { UpdateTechnicalVisitDTO } from '../dtos/update-technical-visit.dto';
import type { UpdateTechnicalVisitService } from '../services/update-technical-visit.service';

import { UpdateTechnicalVisitController } from './update-technical-visit.controller';

const actor = buildAuthenticatedUserFixture({
  id: '33333333-3333-4333-8333-333333333333',
  email: 'actor@test.com',
  role: UserRole.ADMIN,
});

describe('UpdateTechnicalVisitController', () => {
  let controller: UpdateTechnicalVisitController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateTechnicalVisitController({
      execute,
    } as unknown as UpdateTechnicalVisitService);
  });

  it('merge params e body', async () => {
    const params: TechnicalVisitParamDTO = {
      technicalVisitId: '66666666-6666-4666-8666-666666666666',
    };
    const body: UpdateTechnicalVisitDTO = { hasFence: true };
    const row = new TechnicalVisitResponseDTO();
    execute.mockResolvedValue(row);
    const request = { headers: {} } as never;
    await expect(controller.handle(params, body, actor, request)).resolves.toBe(
      row,
    );
    expect(execute).toHaveBeenCalledWith(
      {
        id: params.technicalVisitId,
        ...body,
      },
      actor,
      expect.objectContaining({ actorId: actor.id }),
    );
  });
});
