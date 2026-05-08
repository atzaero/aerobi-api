import type { CreateTechnicalVisitDTO } from '../dtos/create-technical-visit.dto';

import {
  buildTechnicalVisitCreateInput,
  patchTechnicalVisitToPrisma,
} from './technical-visit.prisma.mapper';

describe('technical-visit prisma mapper', () => {
  const oid = 'a7b8c9d0-e1f2-3456-a789-bcdef0123456';

  const minimalCreate = (): CreateTechnicalVisitDTO => ({
    operationalAerodromeId: oid,
    visitAt: new Date('2024-06-02T09:00:00.000Z'),
  });

  it('create conecta operationalAerodrome', () => {
    const input = buildTechnicalVisitCreateInput(minimalCreate());
    expect(input.operationalAerodrome).toEqual({
      connect: { id: oid },
    });
    expect(input.visitAt).toEqual(minimalCreate().visitAt);
  });

  it('patch com modifierUsers', () => {
    expect(
      patchTechnicalVisitToPrisma({ modifierUsers: ['u1', 'u2'] }),
    ).toEqual({
      modifierUsers: ['u1', 'u2'],
    });
  });

  it('patch vazio', () => {
    expect(patchTechnicalVisitToPrisma({})).toEqual({});
  });
});
