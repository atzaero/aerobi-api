import type { PrismaService } from '@/prisma/prisma.service';

import { groupScopeResolvers } from './group-scope.resolvers';
import { GroupScopeSubject } from './group-scope.subject';

describe('groupScopeResolvers[FEEDBACK]', () => {
  const id = '11111111-1111-4111-8111-111111111111';
  let findFirst: jest.Mock;
  let prisma: PrismaService;

  beforeEach(() => {
    findFirst = jest.fn();
    prisma = {
      feedback: { findFirst },
    } as unknown as PrismaService;
  });

  const resolve = () =>
    groupScopeResolvers[GroupScopeSubject.FEEDBACK](prisma, id);

  it('resolve o groupId via FK aerodrome, filtrando ativos', async () => {
    findFirst.mockResolvedValue({ aerodrome: { groupId: 'g-7' } });
    await expect(resolve()).resolves.toBe('g-7');
    expect(findFirst).toHaveBeenCalledWith({
      where: { id, deletedAt: null },
      select: { aerodrome: { select: { groupId: true } } },
    });
  });

  it('null quando o feedback não existe/está removido (→ 404 no guard)', async () => {
    findFirst.mockResolvedValue(null);
    await expect(resolve()).resolves.toBeNull();
  });
});

describe('groupScopeResolvers[TASK]', () => {
  const id = '11111111-1111-4111-8111-111111111111';
  let findFirst: jest.Mock;
  let prisma: PrismaService;

  beforeEach(() => {
    findFirst = jest.fn();
    prisma = {
      maintenanceTask: { findFirst },
    } as unknown as PrismaService;
  });

  const resolve = () => groupScopeResolvers[GroupScopeSubject.TASK](prisma, id);

  it('resolve o groupId exigindo a task e a manutenção-pai ativas', async () => {
    findFirst.mockResolvedValue({
      maintenance: { aerodrome: { groupId: 'g-3' } },
    });
    await expect(resolve()).resolves.toBe('g-3');
    expect(findFirst).toHaveBeenCalledWith({
      where: { id, deletedAt: null, maintenance: { deletedAt: null } },
      select: {
        maintenance: { select: { aerodrome: { select: { groupId: true } } } },
      },
    });
  });

  it('null quando a task ou a manutenção-pai foi removida (→ 404 no guard)', async () => {
    findFirst.mockResolvedValue(null);
    await expect(resolve()).resolves.toBeNull();
  });
});

describe('groupScopeResolvers[TECHNICAL_VISIT]', () => {
  const id = '11111111-1111-4111-8111-111111111111';
  let findFirst: jest.Mock;
  let prisma: PrismaService;

  beforeEach(() => {
    findFirst = jest.fn();
    prisma = {
      technicalVisit: { findFirst },
    } as unknown as PrismaService;
  });

  it('resolve o groupId via aeródromo da visita', async () => {
    findFirst.mockResolvedValue({ aerodrome: { groupId: 'g-tv' } });
    await expect(
      groupScopeResolvers[GroupScopeSubject.TECHNICAL_VISIT](prisma, id),
    ).resolves.toBe('g-tv');
  });

  it('null quando visita não existe', async () => {
    findFirst.mockResolvedValue(null);
    await expect(
      groupScopeResolvers[GroupScopeSubject.TECHNICAL_VISIT](prisma, id),
    ).resolves.toBeNull();
  });
});

describe('groupScopeResolvers[TECHNICAL_VISIT_IMAGE]', () => {
  const id = '99999999-9999-4999-8999-999999999999';
  let findFirst: jest.Mock;
  let prisma: PrismaService;

  beforeEach(() => {
    findFirst = jest.fn();
    prisma = {
      technicalVisitImage: { findFirst },
    } as unknown as PrismaService;
  });

  it('resolve o groupId via visita → aeródromo', async () => {
    findFirst.mockResolvedValue({
      technicalVisit: { aerodrome: { groupId: 'g-img' } },
    });
    await expect(
      groupScopeResolvers[GroupScopeSubject.TECHNICAL_VISIT_IMAGE](prisma, id),
    ).resolves.toBe('g-img');
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id,
        deletedAt: null,
        technicalVisit: { deletedAt: null },
      },
      select: {
        technicalVisit: {
          select: { aerodrome: { select: { groupId: true } } },
        },
      },
    });
  });

  it('null quando imagem não existe', async () => {
    findFirst.mockResolvedValue(null);
    await expect(
      groupScopeResolvers[GroupScopeSubject.TECHNICAL_VISIT_IMAGE](prisma, id),
    ).resolves.toBeNull();
  });
});
