import type { CreateTechnicalVisitDTO } from '../dtos/create-technical-visit.dto';
import { buildTechnicalVisitCreateInput } from '../mappers/technical-visit.prisma.mapper';
import type { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { buildTechnicalVisitFixture } from '../testing/technical-visit.entity.fixture';

import { CreateTechnicalVisitService } from './create-technical-visit.service';

describe('CreateTechnicalVisitService', () => {
  let service: CreateTechnicalVisitService;
  let create: jest.Mock;

  beforeEach(() => {
    create = jest.fn();
    const repo = { create } as unknown as TechnicalVisitRepository;
    service = new CreateTechnicalVisitService(repo);
  });

  it('create com modifierUsers e visitAt', async () => {
    const dto: CreateTechnicalVisitDTO = {
      aerodromeId: '22222222-2222-4222-8222-222222222222',
      modifierUsers: ['u1', 'u2'],
      visitAt: new Date('2024-03-01T08:00:00.000Z'),
      extraObservation: 'note',
    };
    const saved = buildTechnicalVisitFixture({
      modifierUsers: ['u1', 'u2'],
      extraObservation: 'note',
      visitAt: dto.visitAt,
    });
    create.mockResolvedValue(saved);

    await service.execute(dto);

    expect(create).toHaveBeenCalledWith(buildTechnicalVisitCreateInput(dto));
  });
});
