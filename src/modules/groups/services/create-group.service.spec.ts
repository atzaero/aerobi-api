import { Uf, UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { StorageService } from '@/modules/storage/services/storage.service';

import type { CreateGroupDTO } from '../dtos/create-group.dto';
import { buildGroupCreateInput } from '../mappers/group.prisma.mapper';
import type { GroupRepository } from '../repositories/group.repository';
import { buildGroupFixture } from '../testing/group.entity.fixture';

import { CreateGroupService } from './create-group.service';

const storage = {
  getPresignedUrl: jest.fn(),
} as unknown as StorageService;

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

describe('CreateGroupService', () => {
  let service: CreateGroupService;
  let create: jest.Mock;

  beforeEach(() => {
    create = jest.fn();
    const repo = { create } as unknown as GroupRepository;
    service = new CreateGroupService(repo, storage);
  });

  it('persiste com createdBy = ator autenticado', async () => {
    const dto: CreateGroupDTO = {
      uf: Uf.RJ,
      name: 'Sul',
    };
    const saved = buildGroupFixture({
      uf: Uf.RJ,
      name: 'Sul',
      createdBy: actor.id,
    });
    create.mockResolvedValue(saved);

    const out = await service.execute(dto, actor);

    expect(create).toHaveBeenCalledWith(buildGroupCreateInput(dto, actor.id));
    expect(out.name).toBe('Sul');
    expect(out.uf).toBe(Uf.RJ);
    expect(out.createdBy).toBe(actor.id);
  });
});
