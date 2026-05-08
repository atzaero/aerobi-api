import { Uf } from '@/generated/prisma/client';

import type { CreateAerodromeGroupDTO } from '../dtos/create-aerodrome-group.dto';

import {
  buildAerodromeGroupCreateInput,
  patchAerodromeGroupToPrisma,
} from './aerodrome-group.prisma.mapper';

describe('aerodrome-group prisma mapper', () => {
  const createDto = (): CreateAerodromeGroupDTO => ({
    uf: Uf.SP,
    groupName: 'Grupo Norte',
    ownerId: 'owner',
    deletionRequested: false,
  });

  it('build copia todos os campos do create dto', () => {
    expect(buildAerodromeGroupCreateInput(createDto())).toMatchObject({
      uf: Uf.SP,
      groupName: 'Grupo Norte',
      ownerId: 'owner',
      deletionRequested: false,
    });
  });

  it('patch inclui apenas campos com !== undefined', () => {
    expect(patchAerodromeGroupToPrisma({ uf: Uf.RJ })).toEqual({
      uf: Uf.RJ,
    });
  });

  it('patch vazio', () => {
    expect(patchAerodromeGroupToPrisma({})).toEqual({});
  });
});
