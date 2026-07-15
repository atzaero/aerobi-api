import { PrismaService } from '@/prisma/prisma.service';

import { TechnicalVisitRepository } from './technical-visit.repository';

describe('TechnicalVisitRepository.findForDashboard', () => {
  let repository: TechnicalVisitRepository;
  let findMany: jest.Mock;

  const FROM = Date.UTC(2026, 0, 1);
  const TO = Date.UTC(2026, 1, 1);

  beforeEach(() => {
    findMany = jest.fn();
    const prisma = {
      technicalVisit: { findMany },
    } as unknown as PrismaService;
    repository = new TechnicalVisitRepository(prisma);
  });

  it('escopo `all` (null): filtra por visitAt no range + não deletado', async () => {
    findMany.mockResolvedValue([]);

    await repository.findForDashboard(null, FROM, TO);

    const [call] = findMany.mock.calls as Array<[{ where: unknown }]>;
    expect(call[0].where).toEqual({
      deletedAt: null,
      visitAt: { gte: new Date(FROM), lte: new Date(TO) },
    });
  });

  it('escopo `group`: adiciona filtro aerodromeId in lista', async () => {
    findMany.mockResolvedValue([]);

    await repository.findForDashboard(['a-1', 'a-2'], FROM, TO);

    const [call] = findMany.mock.calls as Array<[{ where: unknown }]>;
    expect(call[0].where).toMatchObject({
      aerodromeId: { in: ['a-1', 'a-2'] },
    });
  });

  it('mapeia visitAt para ms e preserva as flags de inspeção', async () => {
    const visitAt = new Date(Date.UTC(2026, 0, 15));
    findMany.mockResolvedValue([
      {
        visitAt,
        hasGatesPadlocks: true,
        hasFence: false,
        hasStandardPlate: null,
        hasQualityHoles: true,
        hasHorizontalSignage: null,
        hasUnobstructedHeadboards: true,
        pavementRegularity: false,
        hasTrashDebris: null,
        hasDelimitedPerimeter: true,
        hasInvasion: false,
      },
    ]);

    const [row] = await repository.findForDashboard(null, FROM, TO);

    expect(row.visitAtMs).toBe(visitAt.getTime());
    expect(row.hasFence).toBe(false);
    expect(row.hasStandardPlate).toBeNull();
    expect(row.hasQualityHoles).toBe(true);
  });
});
