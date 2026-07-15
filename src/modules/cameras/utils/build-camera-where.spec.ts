import type { UserGroupScope } from '@/common/utils/group-scope.util';

import { buildCameraScopedWhere } from './build-camera-where';

const ALL: UserGroupScope = { kind: 'all' };
const GROUP: UserGroupScope = { kind: 'group', groupId: 'g-1' };
const NONE: UserGroupScope = { kind: 'none' };

describe('buildCameraScopedWhere', () => {
  it('escopo none → fail-closed (id in [])', () => {
    expect(buildCameraScopedWhere({}, NONE)).toEqual({ id: { in: [] } });
  });

  it('escopo all → sem restrição de grupo', () => {
    expect(buildCameraScopedWhere({}, ALL)).toEqual({});
  });

  it('escopo group → restringe via aerodrome.groupId', () => {
    expect(buildCameraScopedWhere({}, GROUP)).toEqual({
      aerodrome: { groupId: 'g-1' },
    });
  });

  it('icao → igualdade case-insensitive', () => {
    expect(buildCameraScopedWhere({ icao: 'SBXX' }, ALL)).toEqual({
      icao: { equals: 'SBXX', mode: 'insensitive' },
    });
  });

  it('name → substring case-insensitive', () => {
    expect(buildCameraScopedWhere({ name: 'cab' }, ALL)).toEqual({
      name: { contains: 'cab', mode: 'insensitive' },
    });
  });

  it('filtros + escopo group coexistem (AND implícito)', () => {
    expect(buildCameraScopedWhere({ icao: 'SBXX' }, GROUP)).toEqual({
      icao: { equals: 'SBXX', mode: 'insensitive' },
      aerodrome: { groupId: 'g-1' },
    });
  });
});
