import type { UserGroupScope } from '@/common/utils/group-scope.util';
import { GeojsonStatus } from '@/generated/prisma/client';

import { buildGeojsonScopedWhere } from './build-geojson-where';

const aid = '22222222-2222-4222-8222-222222222222';

describe('buildGeojsonScopedWhere', () => {
  it('scope none → fail-closed (nunca casa)', () => {
    const scope: UserGroupScope = { kind: 'none' };
    expect(buildGeojsonScopedWhere({}, scope)).toEqual({ id: { in: [] } });
  });

  it('scope all → sem restrição de grupo, aplica filtros', () => {
    const scope: UserGroupScope = { kind: 'all' };
    expect(
      buildGeojsonScopedWhere(
        { aerodromeId: aid, status: GeojsonStatus.READY },
        scope,
      ),
    ).toEqual({ aerodromeId: aid, status: GeojsonStatus.READY });
  });

  it('scope group → restringe via aerodrome.groupId', () => {
    const scope: UserGroupScope = { kind: 'group', groupId: 'grp-9' };
    expect(buildGeojsonScopedWhere({}, scope)).toEqual({
      aerodrome: { groupId: 'grp-9' },
    });
  });
});
