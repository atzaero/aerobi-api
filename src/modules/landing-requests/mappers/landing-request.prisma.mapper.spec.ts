import { LandingRequestStatus } from '@/generated/prisma/client';

import type { CreateLandingRequestDTO } from '../dtos/create-landing-request.dto';

import {
  buildLandingRequestCreateInput,
  patchLandingRequestToPrisma,
} from './landing-request.prisma.mapper';

describe('landing-request prisma mapper', () => {
  const aid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  const minimalCreateDto = (): CreateLandingRequestDTO => ({
    operationalAerodromeId: aid,
    status: LandingRequestStatus.PENDING,
    requestDate: new Date('2024-06-01T10:00:00.000Z'),
  });

  it('buildLandingRequestCreateInput liga aeródromo e copia scalares opcionais', () => {
    const dto = {
      ...minimalCreateDto(),
      email: 'a@b.com',
      observation: 'x',
    };
    expect(buildLandingRequestCreateInput(dto)).toMatchObject({
      operationalAerodrome: { connect: { id: aid } },
      email: 'a@b.com',
      observation: 'x',
    });
  });

  it('patchLandingRequestToPrisma atualiza FK quando operationalAerodromeId definido', () => {
    const newAid = 'b2c3d4e5-f6a7-8901-bcde-f23456789012';
    expect(
      patchLandingRequestToPrisma({ operationalAerodromeId: newAid }),
    ).toEqual({
      operationalAerodrome: { connect: { id: newAid } },
    });
  });

  it('patchLandingRequestToPrisma retorna vazio quando DTO sem campos definidos', () => {
    expect(patchLandingRequestToPrisma({})).toEqual({});
  });
});
