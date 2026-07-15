import { Uf } from '@/generated/prisma/client';

import type { CreateGroupDTO } from '../dtos/create-group.dto';

import {
  buildGroupCreateInput,
  patchGroupToPrisma,
} from './group.prisma.mapper';

describe('group prisma mapper', () => {
  const createDto = (): CreateGroupDTO => ({
    uf: Uf.SP,
    name: 'Grupo Norte',
    ownerId: 'owner',
    deletionRequested: false,
  });

  it('build copia os campos do create dto + createdBy do ator', () => {
    expect(buildGroupCreateInput(createDto(), 'actor-1')).toMatchObject({
      uf: Uf.SP,
      name: 'Grupo Norte',
      ownerId: 'owner',
      deletionRequested: false,
      createdBy: 'actor-1',
    });
  });

  it('patch edita só name e grava updatedBy', () => {
    expect(patchGroupToPrisma({ name: 'X' }, 'actor-1')).toEqual({
      name: 'X',
      updatedBy: 'actor-1',
    });
  });
});
