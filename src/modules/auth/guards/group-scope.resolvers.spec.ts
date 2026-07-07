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
