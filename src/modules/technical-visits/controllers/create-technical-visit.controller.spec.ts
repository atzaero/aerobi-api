import { UserRole } from '@/generated/prisma/client';

import { buildAuthenticatedUserFixture } from '@/modules/auth/testing/authenticated-user.fixtures';

import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import type { CreateTechnicalVisitDTO } from '../dtos/create-technical-visit.dto';
import type { CreateTechnicalVisitService } from '../services/create-technical-visit.service';

import { CreateTechnicalVisitController } from './create-technical-visit.controller';

const actor = buildAuthenticatedUserFixture({
  id: '33333333-3333-4333-8333-333333333333',
  email: 'actor@test.com',
  role: UserRole.ADMIN,
});

describe('CreateTechnicalVisitController', () => {
  let controller: CreateTechnicalVisitController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateTechnicalVisitController({
      execute,
    } as unknown as CreateTechnicalVisitService);
  });

  it('delega', async () => {
    const dto: CreateTechnicalVisitDTO = {
      aerodromeId: '22222222-2222-4222-8222-222222222222',
      visitorName: 'Vistoriador',
      city: 'Goiânia',
      visitAt: new Date(),
    };
    const row = new TechnicalVisitResponseDTO();
    execute.mockResolvedValue(row);
    const request = { headers: {} } as never;
    await expect(controller.handle(dto, actor, request)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(
      dto,
      actor,
      expect.objectContaining({ actorId: actor.id }),
    );
  });
});
