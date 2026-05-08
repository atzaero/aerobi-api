import type { CreateOperationalAerodromeDTO } from '../dtos/create-operational-aerodrome.dto';
import { buildOperationalAerodromeCreateInput } from '../mappers/operational-aerodrome.prisma.mapper';
import type { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';
import { buildOperationalAerodromeFixture } from '../testing/operational-aerodrome.entity.fixture';

import { CreateOperationalAerodromeService } from './create-operational-aerodrome.service';

describe('CreateOperationalAerodromeService', () => {
  let service: CreateOperationalAerodromeService;
  let create: jest.Mock;

  beforeEach(() => {
    create = jest.fn();
    const repo = { create } as unknown as OperationalAerodromeRepository;
    service = new CreateOperationalAerodromeService(repo);
  });

  it('persistência com grupo connect', async () => {
    const gid = '44444444-4444-4444-8444-444444444444';
    const dto: CreateOperationalAerodromeDTO = {
      groupId: gid,
      icao: 'SBSP',
      name: 'Congonhas',
      latitude: '1',
      longitude: '2',
      isOpen: true,
      isView: true,
    };
    const saved = buildOperationalAerodromeFixture({
      groupId: gid,
      icao: 'SBSP',
      name: 'Congonhas',
      isView: true,
    });
    create.mockResolvedValue(saved);

    const out = await service.execute(dto);

    expect(create).toHaveBeenCalledWith(
      buildOperationalAerodromeCreateInput(dto),
    );
    expect(out.icao).toBe('SBSP');
    expect(out.groupId).toBe(gid);
  });
});
