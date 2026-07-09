import { PrismaService } from '@/prisma/prisma.service';

import { FeedbackRepository } from './feedback.repository';

describe('FeedbackRepository.findForDashboard', () => {
  let repository: FeedbackRepository;
  let findMany: jest.Mock;

  const FROM = Date.UTC(2026, 0, 1);
  const TO = Date.UTC(2026, 1, 1);

  beforeEach(() => {
    findMany = jest.fn();
    const prisma = {
      feedback: { findMany },
    } as unknown as PrismaService;
    repository = new FeedbackRepository(prisma);
  });

  it('escopo `all` (null): filtra por createdAt no range + não deletado', async () => {
    findMany.mockResolvedValue([]);

    await repository.findForDashboard(null, FROM, TO);

    expect(findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        createdAt: { gte: new Date(FROM), lte: new Date(TO) },
      },
      select: { rating: true },
    });
  });

  it('escopo `group`: adiciona filtro aerodromeId in lista', async () => {
    findMany.mockResolvedValue([]);

    await repository.findForDashboard(['a-1'], FROM, TO);

    const [call] = findMany.mock.calls as Array<[{ where: unknown }]>;
    expect(call[0].where).toMatchObject({ aerodromeId: { in: ['a-1'] } });
  });
});
