import { Uf } from '@/generated/prisma/client';

import type { CreateAerodromeGroupDTO } from '../dtos/create-aerodrome-group.dto';

import {
  buildAerodromeGroupCreateInput,
  patchAerodromeGroupToPrisma,
} from './aerodrome-group.prisma.mapper';

describe('aerodrome-group prisma mapper', () => {
  const createDto = (): CreateAerodromeGroupDTO => ({
    uf: Uf.SP,
    name: 'Grupo Norte',
    ownerId: 'owner',
    deletionRequested: false,
  });

  it('build copia os campos do create dto + createdBy do ator', () => {
    expect(
      buildAerodromeGroupCreateInput(createDto(), 'actor-1'),
    ).toMatchObject({
      uf: Uf.SP,
      name: 'Grupo Norte',
      ownerId: 'owner',
      deletionRequested: false,
      createdBy: 'actor-1',
    });
  });

  it('patch edita só name e grava updatedBy', () => {
    expect(patchAerodromeGroupToPrisma({ name: 'X' }, 'actor-1')).toEqual({
      name: 'X',
      updatedBy: 'actor-1',
    });
  });
});
