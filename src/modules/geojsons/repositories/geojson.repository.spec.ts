import { GeojsonStatus } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import { buildGeojsonFixture } from '../testing/geojson.entity.fixture';

import { GeojsonRepository } from './geojson.repository';

const aerodromeSelect = {
  aerodrome: {
    select: {
      icao: true,
      groupId: true,
      group: { select: { uf: true } },
    },
  },
};

describe('GeojsonRepository', () => {
  let repository: GeojsonRepository;
  let findFirst: jest.Mock;
  let findMany: jest.Mock;

  beforeEach(() => {
    findFirst = jest.fn();
    findMany = jest.fn();
    const prisma = {
      geojson: { findFirst, findMany },
    } as unknown as PrismaService;
    repository = new GeojsonRepository(prisma);
  });

  it('findAllActiveVisible: READY + soft-delete + aeródromo isView', async () => {
    findMany.mockResolvedValue([]);

    await repository.findAllActiveVisible();

    expect(findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        status: GeojsonStatus.READY,
        aerodrome: { isView: true, deletedAt: null },
      },
      include: aerodromeSelect,
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
    });
  });

  it('findActiveVisibleByAerodromeId: aerodromeId + soft-delete + isView', async () => {
    const aerodromeId = '22222222-2222-4222-8222-222222222222';
    const found = buildGeojsonFixture({ aerodromeId });
    findFirst.mockResolvedValue(found);

    await expect(
      repository.findActiveVisibleByAerodromeId(aerodromeId),
    ).resolves.toBe(found);
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        aerodromeId,
        deletedAt: null,
        aerodrome: { isView: true, deletedAt: null },
      },
      include: aerodromeSelect,
    });
  });
});
