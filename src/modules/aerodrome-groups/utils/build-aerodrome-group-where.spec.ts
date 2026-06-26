import type { UserGroupScope } from '@/common/utils/group-scope.util';
import { Uf } from '@/generated/prisma/client';

import { buildAerodromeGroupScopedWhere } from './build-aerodrome-group-where';

describe('buildAerodromeGroupScopedWhere', () => {
  it('none → fail-closed (id in [], nunca casa)', () => {
    expect(buildAerodromeGroupScopedWhere({}, { kind: 'none' })).toEqual({
      id: { in: [] },
    });
  });

  it('all (ADMIN) sem filtros → where vazio', () => {
    expect(buildAerodromeGroupScopedWhere({}, { kind: 'all' })).toEqual({});
  });

  it('group → força id ao próprio grupo', () => {
    const scope: UserGroupScope = { kind: 'group', groupId: 'g9' };
    expect(buildAerodromeGroupScopedWhere({}, scope)).toEqual({ id: 'g9' });
  });

  it('combina uf + name (substring case-insensitive) com o escopo', () => {
    const scope: UserGroupScope = { kind: 'group', groupId: 'g9' };
    expect(
      buildAerodromeGroupScopedWhere({ uf: Uf.SP, name: 'aero' }, scope),
    ).toEqual({
      uf: Uf.SP,
      name: { contains: 'aero', mode: 'insensitive' },
      id: 'g9',
    });
  });

  it('none ignora filtros (segurança acima do filtro)', () => {
    expect(
      buildAerodromeGroupScopedWhere(
        { uf: Uf.SP, name: 'aero' },
        { kind: 'none' },
      ),
    ).toEqual({ id: { in: [] } });
  });
});
