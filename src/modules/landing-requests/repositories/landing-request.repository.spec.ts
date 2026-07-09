import { PrismaService } from '@/prisma/prisma.service';

import { LandingRequestRepository } from './landing-request.repository';

describe('LandingRequestRepository.findForDashboard', () => {
  let repository: LandingRequestRepository;
  let findMany: jest.Mock;

  const FROM = Date.UTC(2026, 0, 1);
  const TO = Date.UTC(2026, 1, 1);

  beforeEach(() => {
    findMany = jest.fn();
    const prisma = {
      landingRequest: { findMany },
    } as unknown as PrismaService;
    repository = new LandingRequestRepository(prisma);
  });

  it('escopo `all` (null): filtra só por range + não deletado', async () => {
    findMany.mockResolvedValue([]);

    await repository.findForDashboard(null, FROM, TO);

    expect(findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        requestDate: { gte: new Date(FROM), lte: new Date(TO) },
      },
      select: { requestDate: true, reviewedAt: true, status: true },
    });
  });

  it('escopo `group`: adiciona filtro aerodromeId in lista', async () => {
    findMany.mockResolvedValue([]);

    await repository.findForDashboard(['a-1'], FROM, TO);

    const [call] = findMany.mock.calls as Array<[{ where: unknown }]>;
    expect(call[0].where).toMatchObject({ aerodromeId: { in: ['a-1'] } });
  });

  it('mapeia datas para ms; reviewedAt ausente → null', async () => {
    const requestDate = new Date(Date.UTC(2026, 0, 10));
    const reviewedAt = new Date(Date.UTC(2026, 0, 12));
    findMany.mockResolvedValue([
      { requestDate, reviewedAt, status: 'APPROVED' },
      { requestDate, reviewedAt: null, status: 'PENDING' },
    ]);

    const rows = await repository.findForDashboard(null, FROM, TO);

    expect(rows).toEqual([
      {
        requestDateMs: requestDate.getTime(),
        reviewedAtMs: reviewedAt.getTime(),
        status: 'APPROVED',
      },
      {
        requestDateMs: requestDate.getTime(),
        reviewedAtMs: null,
        status: 'PENDING',
      },
    ]);
  });
});
