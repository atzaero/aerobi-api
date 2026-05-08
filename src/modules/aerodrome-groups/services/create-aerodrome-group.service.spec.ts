import { Uf } from '@/generated/prisma/client';

import type { CreateAerodromeGroupDTO } from '../dtos/create-aerodrome-group.dto';
import { buildAerodromeGroupCreateInput } from '../mappers/aerodrome-group.prisma.mapper';
import type { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { buildAerodromeGroupFixture } from '../testing/aerodrome-group.entity.fixture';

import { CreateAerodromeGroupService } from './create-aerodrome-group.service';

describe('CreateAerodromeGroupService', () => {
  let service: CreateAerodromeGroupService;
  let create: jest.Mock;

  beforeEach(() => {
    create = jest.fn();
    const repo = { create } as unknown as AerodromeGroupRepository;
    service = new CreateAerodromeGroupService(repo);
  });

  it('persistência com prisma mapper', async () => {
    const dto: CreateAerodromeGroupDTO = {
      uf: Uf.RJ,
      groupName: 'Sul',
    };
    const saved = buildAerodromeGroupFixture({ uf: Uf.RJ, groupName: 'Sul' });
    create.mockResolvedValue(saved);

    const out = await service.execute(dto);

    expect(create).toHaveBeenCalledWith(buildAerodromeGroupCreateInput(dto));
    expect(out.groupName).toBe('Sul');
    expect(out.uf).toBe(Uf.RJ);
  });
});
