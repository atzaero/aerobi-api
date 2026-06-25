import { Uf, UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { CreateAerodromeGroupDTO } from '../dtos/create-aerodrome-group.dto';
import { buildAerodromeGroupCreateInput } from '../mappers/aerodrome-group.prisma.mapper';
import type { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { buildAerodromeGroupFixture } from '../testing/aerodrome-group.entity.fixture';

import { CreateAerodromeGroupService } from './create-aerodrome-group.service';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

describe('CreateAerodromeGroupService', () => {
  let service: CreateAerodromeGroupService;
  let create: jest.Mock;

  beforeEach(() => {
    create = jest.fn();
    const repo = { create } as unknown as AerodromeGroupRepository;
    service = new CreateAerodromeGroupService(repo);
  });

  it('persiste com createdBy = ator autenticado', async () => {
    const dto: CreateAerodromeGroupDTO = {
      uf: Uf.RJ,
      name: 'Sul',
    };
    const saved = buildAerodromeGroupFixture({
      uf: Uf.RJ,
      name: 'Sul',
      createdBy: actor.id,
    });
    create.mockResolvedValue(saved);

    const out = await service.execute(dto, actor);

    expect(create).toHaveBeenCalledWith(
      buildAerodromeGroupCreateInput(dto, actor.id),
    );
    expect(out.name).toBe('Sul');
    expect(out.uf).toBe(Uf.RJ);
    expect(out.createdBy).toBe(actor.id);
  });
});
