import type { PrismaService } from '@/prisma/prisma.service';

import { groupScopeResolvers } from './group-scope.resolvers';
import { GroupScopeSubject } from './group-scope.subject';

describe('groupScopeResolvers[AERODROME_FEEDBACK]', () => {
  const id = '11111111-1111-4111-8111-111111111111';
  let findFirst: jest.Mock;
  let prisma: PrismaService;

  beforeEach(() => {
    findFirst = jest.fn();
    prisma = {
      aerodromeFeedback: { findFirst },
    } as unknown as PrismaService;
  });

  const resolve = () =>
    groupScopeResolvers[GroupScopeSubject.AERODROME_FEEDBACK](prisma, id);

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
