import { UserRole } from '@/generated/prisma/client';

import { buildAuthenticatedUserFixture } from '@/modules/auth/testing/authenticated-user.fixtures';

import { TechnicalVisitImageParamDTO } from '../dtos/technical-visit-image-param.dto';
import { TechnicalVisitImageResponseDTO } from '../dtos/technical-visit-image-response.dto';
import type { RemoveTechnicalVisitImageService } from '../services/remove-technical-visit-image.service';

import { RemoveTechnicalVisitImageController } from './remove-technical-visit-image.controller';

const actor = buildAuthenticatedUserFixture({
  id: '33333333-3333-4333-8333-333333333333',
  email: 'actor@test.com',
  role: UserRole.ADMIN,
});

const visitId = '11111111-1111-4111-8111-111111111111';
const imageId = '99999999-9999-4999-8999-999999999999';

describe('RemoveTechnicalVisitImageController', () => {
  let controller: RemoveTechnicalVisitImageController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveTechnicalVisitImageController({
      execute,
    } as unknown as RemoveTechnicalVisitImageService);
  });

  it('delega remoção com ator e contexto de audit', async () => {
    const params: TechnicalVisitImageParamDTO = {
      technicalVisitId: visitId,
      imageId,
    };
    const row = new TechnicalVisitImageResponseDTO();
    execute.mockResolvedValue(row);
    const request = { headers: {} } as never;

    await expect(controller.handle(params, actor, request)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(
      visitId,
      imageId,
      actor,
      expect.objectContaining({ actorId: actor.id }),
    );
  });
});
