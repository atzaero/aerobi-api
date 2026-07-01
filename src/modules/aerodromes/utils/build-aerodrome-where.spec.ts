import { Uf } from '@/generated/prisma/client';

import { buildAerodromeScopedWhere } from './build-aerodrome-where';

describe('buildAerodromeScopedWhere', () => {
  const gid = '44444444-4444-4444-8444-444444444444';

  it('none → fail-closed (nunca casa nada)', () => {
    expect(buildAerodromeScopedWhere({}, { kind: 'none' })).toEqual({
      id: { in: [] },
    });
  });

  it('group força groupId e ignora filters.groupId', () => {
    expect(
      buildAerodromeScopedWhere(
        { groupId: 'other-group' },
        { kind: 'group', groupId: gid },
      ),
    ).toEqual({ groupId: gid });
  });

  it('all + search → OR em icao/name/municipality', () => {
    expect(
      buildAerodromeScopedWhere({ search: 'sb' }, { kind: 'all' }),
    ).toEqual({
      OR: [
        { icao: { contains: 'sb', mode: 'insensitive' } },
        { name: { contains: 'sb', mode: 'insensitive' } },
        { municipality: { contains: 'sb', mode: 'insensitive' } },
      ],
    });
  });

  it('uf filtra pela relação group.uf', () => {
    expect(buildAerodromeScopedWhere({ uf: Uf.PI }, { kind: 'all' })).toEqual({
      group: { uf: Uf.PI },
    });
  });

  it('all + groupId aplica o filtro (ADMIN)', () => {
    expect(
      buildAerodromeScopedWhere({ groupId: gid }, { kind: 'all' }),
    ).toEqual({ groupId: gid });
  });

  it('isOpen/isView combinam', () => {
    expect(
      buildAerodromeScopedWhere(
        { isOpen: true, isView: false },
        { kind: 'all' },
      ),
    ).toEqual({ isOpen: true, isView: false });
  });
});
