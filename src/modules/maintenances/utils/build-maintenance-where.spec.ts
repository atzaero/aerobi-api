import type { UserGroupScope } from '@/common/utils/group-scope.util';
import { Uf } from '@/generated/prisma/client';

import {
  applyOverduePendingFilter,
  buildMaintenanceScopedWhere,
} from './build-maintenance-where';

const ALL: UserGroupScope = { kind: 'all' };

describe('buildMaintenanceScopedWhere', () => {
  it('escopo none nunca vaza registros (id in [])', () => {
    expect(buildMaintenanceScopedWhere({}, { kind: 'none' })).toEqual({
      id: { in: [] },
    });
  });

  it('sem filtros e escopo all retorna where vazio', () => {
    expect(buildMaintenanceScopedWhere({}, ALL)).toEqual({});
  });

  it('filtra name por substring case-insensitive', () => {
    expect(buildMaintenanceScopedWhere({ name: 'foo' }, ALL)).toEqual({
      name: { contains: 'foo', mode: 'insensitive' },
    });
  });

  it('filtra por aerodromeId exato', () => {
    expect(buildMaintenanceScopedWhere({ aerodromeId: 'a1' }, ALL)).toEqual({
      aerodromeId: 'a1',
    });
  });

  it('filtra uf via aerodrome.group', () => {
    expect(buildMaintenanceScopedWhere({ uf: Uf.PI }, ALL)).toEqual({
      aerodrome: { group: { uf: Uf.PI } },
    });
  });

  it('filtra aerodromeName por name/icao/municipality com trim', () => {
    expect(
      buildMaintenanceScopedWhere({ aerodromeName: '  SBSP  ' }, ALL),
    ).toEqual({
      aerodrome: {
        OR: [
          { name: { contains: 'SBSP', mode: 'insensitive' } },
          { icao: { contains: 'SBSP', mode: 'insensitive' } },
          { municipality: { contains: 'SBSP', mode: 'insensitive' } },
        ],
      },
    });
  });

  it('restringe ao groupId quando o escopo é de grupo', () => {
    expect(
      buildMaintenanceScopedWhere({}, { kind: 'group', groupId: 'g1' }),
    ).toEqual({
      aerodrome: { groupId: 'g1' },
    });
  });

  it('publicAccess=true exige e-mails e código não vazio via AND', () => {
    expect(buildMaintenanceScopedWhere({ publicAccess: true }, ALL)).toEqual({
      AND: [
        { authorizedEmails: { isEmpty: false } },
        { securityCode: { not: null } },
        { NOT: { securityCode: '' } },
      ],
    });
  });

  it('publicAccess=false casa intervenções privadas via AND/OR', () => {
    expect(buildMaintenanceScopedWhere({ publicAccess: false }, ALL)).toEqual({
      AND: [
        {
          OR: [
            { authorizedEmails: { isEmpty: true } },
            { securityCode: null },
            { securityCode: '' },
          ],
        },
      ],
    });
  });
});

describe('applyOverduePendingFilter', () => {
  const items = [
    { id: 'a', overduePendingCount: 0 },
    { id: 'b', overduePendingCount: 2 },
  ];

  it('retorna todos quando o filtro não é informado', () => {
    expect(applyOverduePendingFilter(items)).toBe(items);
  });

  it('mantém apenas os com atraso pendente quando true', () => {
    expect(applyOverduePendingFilter(items, true)).toEqual([
      { id: 'b', overduePendingCount: 2 },
    ]);
  });

  it('mantém apenas os sem atraso pendente quando false', () => {
    expect(applyOverduePendingFilter(items, false)).toEqual([
      { id: 'a', overduePendingCount: 0 },
    ]);
  });
});
