import type { CreateAerodromeDTO } from '../dtos/create-aerodrome.dto';
import { buildAerodromeCreateInput } from '../mappers/aerodrome.prisma.mapper';
import type { AerodromeRepository } from '../repositories/aerodrome.repository';
import { buildAerodromeFixture } from '../testing/aerodrome.entity.fixture';

import { CreateAerodromeService } from './create-aerodrome.service';

describe('CreateAerodromeService', () => {
  let service: CreateAerodromeService;
  let create: jest.Mock;

  beforeEach(() => {
    create = jest.fn();
    const repo = { create } as unknown as AerodromeRepository;
    service = new CreateAerodromeService(repo);
  });

  it('persistência com grupo connect', async () => {
    const gid = '44444444-4444-4444-8444-444444444444';
    const dto: CreateAerodromeDTO = {
      groupId: gid,
      icao: 'SBSP',
      name: 'Congonhas',
      latitude: '1',
      longitude: '2',
      isOpen: true,
      isView: true,
    };
    const saved = buildAerodromeFixture({
      groupId: gid,
      icao: 'SBSP',
      name: 'Congonhas',
      isView: true,
    });
    create.mockResolvedValue(saved);

    const out = await service.execute(dto);

    expect(create).toHaveBeenCalledWith(buildAerodromeCreateInput(dto));
    expect(out.icao).toBe('SBSP');
    expect(out.groupId).toBe(gid);
  });
});
