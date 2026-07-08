import type { CreateTechnicalVisitDTO } from '../dtos/create-technical-visit.dto';

import {
  buildTechnicalVisitCreateInput,
  patchTechnicalVisitToPrisma,
} from './technical-visit.prisma.mapper';

describe('technical-visit prisma mapper', () => {
  const oid = 'a7b8c9d0-e1f2-3456-a789-bcdef0123456';
  const actorId = '33333333-3333-4333-8333-333333333333';

  const minimalCreate = (): CreateTechnicalVisitDTO => ({
    aerodromeId: oid,
    visitorName: 'Vistoriador',
    city: 'Goiânia',
    visitAt: new Date('2024-06-02T09:00:00.000Z'),
  });

  it('create conecta aerodrome e grava ator', () => {
    const input = buildTechnicalVisitCreateInput(minimalCreate(), actorId);
    expect(input.aerodrome).toEqual({
      connect: { id: oid },
    });
    expect(input.modifierUsers).toEqual([actorId]);
    expect(input.modifierAtTimes).toHaveLength(1);
    expect(input.createdBy).toBe(actorId);
    expect(input.updatedBy).toBe(actorId);
  });

  it('patch append modifierUsers e updatedBy', () => {
    const at = new Date('2024-06-02T10:00:00.000Z');
    expect(
      patchTechnicalVisitToPrisma(
        { visitorName: 'Novo' },
        actorId,
        ['u1'],
        [new Date('2024-06-01T12:00:00.000Z')],
        at,
      ),
    ).toEqual({
      visitorName: 'Novo',
      modifierUsers: ['u1', actorId],
      modifierAtTimes: [new Date('2024-06-01T12:00:00.000Z'), at],
      updatedBy: actorId,
    });
  });

  it('patch vazio append só ator', () => {
    const at = new Date('2024-06-02T10:00:00.000Z');
    expect(patchTechnicalVisitToPrisma({}, actorId, [], [], at)).toEqual({
      modifierUsers: [actorId],
      modifierAtTimes: [at],
      updatedBy: actorId,
    });
  });
});
