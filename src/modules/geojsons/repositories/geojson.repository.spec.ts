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

  beforeEach(() => {
    findFirst = jest.fn();
    const prisma = {
      geojson: { findFirst },
    } as unknown as PrismaService;
    repository = new GeojsonRepository(prisma);
  });

  it('findActiveByAerodromeId: aerodromeId + soft-delete + include pai', async () => {
    const aerodromeId = '22222222-2222-4222-8222-222222222222';
    const found = buildGeojsonFixture({ aerodromeId });
    findFirst.mockResolvedValue(found);

    await expect(repository.findActiveByAerodromeId(aerodromeId)).resolves.toBe(
      found,
    );
    expect(findFirst).toHaveBeenCalledWith({
      where: { aerodromeId, deletedAt: null },
      include: aerodromeSelect,
    });
  });
});
