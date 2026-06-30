import type { UserGroupScope } from '@/common/utils/group-scope.util';
import { Uf } from '@/generated/prisma/client';

import { buildGroupScopedWhere } from './build-group-where';

describe('buildGroupScopedWhere', () => {
  it('none → fail-closed (id in [], nunca casa)', () => {
    expect(buildGroupScopedWhere({}, { kind: 'none' })).toEqual({
      id: { in: [] },
    });
  });

  it('all (ADMIN) sem filtros → where vazio', () => {
    expect(buildGroupScopedWhere({}, { kind: 'all' })).toEqual({});
  });

  it('group → força id ao próprio grupo', () => {
    const scope: UserGroupScope = { kind: 'group', groupId: 'g9' };
    expect(buildGroupScopedWhere({}, scope)).toEqual({ id: 'g9' });
  });

  it('combina uf + name (substring case-insensitive) com o escopo', () => {
    const scope: UserGroupScope = { kind: 'group', groupId: 'g9' };
    expect(buildGroupScopedWhere({ uf: Uf.SP, name: 'aero' }, scope)).toEqual({
      uf: Uf.SP,
      name: { contains: 'aero', mode: 'insensitive' },
      id: 'g9',
    });
  });

  it('none ignora filtros (segurança acima do filtro)', () => {
    expect(
      buildGroupScopedWhere({ uf: Uf.SP, name: 'aero' }, { kind: 'none' }),
    ).toEqual({ id: { in: [] } });
  });
});
