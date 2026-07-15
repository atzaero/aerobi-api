import type { UserGroupScope } from '@/common/utils/group-scope.util';
import { LandingRequestStatus } from '@/generated/prisma/client';

import type { LandingRequestFilterQueryDTO } from '../dtos/landing-request-filter-query.dto';
import { buildLandingRequestScopedWhere } from './build-landing-request-where';

const filters = (
  overrides: Partial<LandingRequestFilterQueryDTO> = {},
): LandingRequestFilterQueryDTO => overrides;

const ALL: UserGroupScope = { kind: 'all' };
const GROUP: UserGroupScope = { kind: 'group', groupId: 'g1' };
const NONE: UserGroupScope = { kind: 'none' };

describe('buildLandingRequestScopedWhere', () => {
  it('escopo none: fail-closed (id in [])', () => {
    expect(buildLandingRequestScopedWhere(filters(), NONE)).toEqual({
      id: { in: [] },
    });
  });

  it('escopo group: restringe via aerodrome.groupId', () => {
    expect(buildLandingRequestScopedWhere(filters(), GROUP)).toEqual({
      aerodrome: { groupId: 'g1' },
    });
  });

  it('escopo all: sem restrição de grupo', () => {
    expect(buildLandingRequestScopedWhere(filters(), ALL)).toEqual({});
  });

  it('status/aerodromeId por igualdade', () => {
    const where = buildLandingRequestScopedWhere(
      filters({
        status: LandingRequestStatus.PENDING,
        aerodromeId: 'a1',
      }),
      ALL,
    );
    expect(where).toMatchObject({
      status: LandingRequestStatus.PENDING,
      aerodromeId: 'a1',
    });
  });

  it('ICAO/modelo/matrícula/pilotCode/email por substring case-insensitive', () => {
    const where = buildLandingRequestScopedWhere(
      filters({
        departureIcao: 'sb',
        arrivalIcao: 'sd',
        aircraftModel: 'cessna',
        aircraftRegistration: 'pt',
        pilotCode: '204',
        email: 'piloto',
      }),
      ALL,
    );
    expect(where.departureAerodrome).toEqual({
      contains: 'sb',
      mode: 'insensitive',
    });
    expect(where.icao).toEqual({ contains: 'sd', mode: 'insensitive' });
    expect(where.aircraftModel).toEqual({
      contains: 'cessna',
      mode: 'insensitive',
    });
    expect(where.aircraftRegistration).toEqual({
      contains: 'pt',
      mode: 'insensitive',
    });
    expect(where.pilotCode).toEqual({ contains: '204', mode: 'insensitive' });
    expect(where.email).toEqual({ contains: 'piloto', mode: 'insensitive' });
  });

  it('intervalos de requestDate/responseDate inclusivos (UTC)', () => {
    const where = buildLandingRequestScopedWhere(
      filters({
        requestDateFrom: '2026-01-01',
        requestDateTo: '2026-01-31',
        responseDateFrom: '2026-02-01',
      }),
      ALL,
    );
    expect(where.requestDate).toEqual({
      gte: new Date('2026-01-01T00:00:00.000Z'),
      lte: new Date('2026-01-31T23:59:59.999Z'),
    });
    expect(where.reviewedAt).toEqual({
      gte: new Date('2026-02-01T00:00:00.000Z'),
    });
  });

  it('escopo none ignora filtros (segurança em primeiro lugar)', () => {
    expect(
      buildLandingRequestScopedWhere(filters({ email: 'x' }), NONE),
    ).toEqual({ id: { in: [] } });
  });
});
