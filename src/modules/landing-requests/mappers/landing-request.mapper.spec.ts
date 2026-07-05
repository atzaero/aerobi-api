import {
  LandingRequestStatus,
  UserRole,
  type LandingRequestAircraft,
} from '@/generated/prisma/client';

import { buildLandingRequestFixture } from '../testing/landing-request.entity.fixture';
import {
  LandingRequestMapper,
  type LandingRequestReviewer,
} from './landing-request.mapper';

describe('LandingRequestMapper.toApiRow', () => {
  it('deriva answer do status (APPROVED→true, REJECTED→false, PENDING→null)', () => {
    expect(
      LandingRequestMapper.toApiRow(
        buildLandingRequestFixture({ status: LandingRequestStatus.APPROVED }),
      ).answer,
    ).toBe(true);
    expect(
      LandingRequestMapper.toApiRow(
        buildLandingRequestFixture({ status: LandingRequestStatus.REJECTED }),
      ).answer,
    ).toBe(false);
    expect(
      LandingRequestMapper.toApiRow(
        buildLandingRequestFixture({ status: LandingRequestStatus.PENDING }),
      ).answer,
    ).toBeNull();
  });

  it('mascara o CPF do piloto', () => {
    const row = LandingRequestMapper.toApiRow(
      buildLandingRequestFixture({ pilotCpf: '12345678909' }),
    );
    expect(row.pilotCpf).toBe('123.456.***-**');
  });

  it('não expõe deletedAt/deletedBy', () => {
    const row = LandingRequestMapper.toApiRow(
      buildLandingRequestFixture({
        deletedAt: new Date(),
        deletedBy: 'someone',
      }),
    );
    expect('deletedAt' in row).toBe(false);
    expect('deletedBy' in row).toBe(false);
  });

  it('inclui o revisor resolvido quando fornecido', () => {
    const reviewer: LandingRequestReviewer = {
      id: 'u1',
      name: 'Coord',
      email: 'coord@a.com',
      role: UserRole.COORDINATOR,
    };
    const row = LandingRequestMapper.toApiRow(
      buildLandingRequestFixture({ reviewedBy: 'u1' }),
      { reviewer },
    );
    expect(row.reviewer).toEqual(reviewer);
  });

  it('inclui rabAircraft quando o snapshot é fornecido (get-by-id)', () => {
    const aircraft = {
      period: '2026-07',
      marcas: 'PTABC',
    } as LandingRequestAircraft;
    const row = LandingRequestMapper.toApiRow(buildLandingRequestFixture(), {
      aircraft,
    });
    expect(row.rabAircraft?.marcas).toBe('PTABC');
  });

  it('rabAircraft ausente por padrão (list não inclui)', () => {
    const row = LandingRequestMapper.toApiRow(buildLandingRequestFixture());
    expect(row.rabAircraft).toBeUndefined();
  });
});
